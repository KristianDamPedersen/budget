# Modular Monolith Architecture (Ruby / Rails)
This document describes the architecture of our modular monolith implemented in Ruby on Rails using:
* ActiveRecord (AR) for entity persistence
* RubyEventStore (RES) for event-based communication
* Per-module Postgres schemas for strong physical boundaries
* Namespaced domain modules (Users, Events, Analytics, …)
* Use cases as the application layer
* Domain and integration events for communication
* HTTP controllers that talk only to use cases
* Optional async job processing
The goal is to keep boundaries explicit while staying fully idiomatic in Ruby and Rails.

## 1. Architectural Goals
* Create clean bounded contexts within a single deployable application.
* Use Rails conventions where helpful, avoid over-engineering.
* Keep domain logic isolated and testable.
* Use events (via RES) to decouple modules.
* Maintain per-module database schemas for clearer physical boundaries.
* Allow horizontal scaling (web + worker processes).
* Keep the system maintainable, evolvable, and eventually extractable if needed.

## 2. Folder Structure
All domain logic lives under app/domains. Each module is isolated.
```
app/
  domains/
    users/
      domain/
        user.rb
      use_cases/
        register_user.rb
      events/
        user_registered.rb
      handlers/
        send_welcome_email_on_user_registered.rb
        publish_user_registered_integration_event.rb

    events/
      domain/
        event.rb
      use_cases/
        schedule_event.rb
      events/
        event_scheduled.rb
      handlers/
        notify_attendees_on_event_scheduled.rb
        publish_event_scheduled_integration_event.rb

    analytics/
      domain/
        event_metric.rb
      use_cases/
        rebuild_event_metrics.rb
      handlers/
        track_signup_on_user_registered.rb

    integration/
      events/
        users/
          user_registered.rb
        events/
          event_scheduled.rb

controllers/
  api/
    v1/
      users/
        registrations_controller.rb

config/
  initializers/
    event_store.rb
  routes.rb

db/
  migrate/
```

## 3. Dependency Rules
### Allowed
* A use case may access:
    * Its own module's AR models
    * The configured event_store
* A handler may access:
    * Its own module's entities
    * Integration events from other modules
* Modules can observe each other via integration events.
### Not Allowed
* Cross-module direct access to entities (Users::User cannot be accessed from Analytics)
* Subscribing to another module’s domain events
* Controllers accessing domain entities directly (must use use cases)
Rule of thumb
* Internal communication → domain events
* Cross-module communication → integration events

## 4. Event Types
### 4.1 Domain Events (internal)
* Namespaced under <Module>::Events::*
* Only used inside the same module
* Free to change as long as consumers in that module are updated

Example:
```ruby
module Users
  module Events
    class UserRegistered < RailsEventStore::Event
    end
  end
end
```

### 4.2 Integration Events (external)
* Namespaced under Integration::Events::<Module>
* Consumed by other modules
* More stable structure
```ruby
module Integration
  module Events
    module Users
      class UserRegistered < RailsEventStore::Event
      end
    end
  end
end
```


### 4.3 Mapping Domain → Integration
Handled by mapping handlers inside the module:
```ruby
module Users
  module Handlers
    class PublishUserRegisteredIntegrationEvent
      def call(domain_event)
        Rails.configuration.event_store.publish(
          Integration::Events::Users::UserRegistered.new(
            data: {
              user_id: domain_event.data[:user_id],
              email:   domain_event.data[:email]
            }
          )
        )
      end
    end
  end
end
```

## 5. Persistence Layer
### 5.1 ActiveRecord (skinny AR)
Entities are just AR models inside the domain:
```ruby
```ruby
module Users
  module Domain
    class User < ApplicationRecord
      self.table_name = "users.users"

      validates :email, presence: true
      validates :name,  presence: true

      scope :active, -> { where(active: true) }

      def deactivate!
        raise "Already deactivated" unless active?
        update!(active: false)
      end
    end
  end
end
```

### 5.2 RubyEventStore
Used to:
* Persist domain & integration events
* Publish events into RES
* Dispatch to synchronous or asynchronous handlers
Tables:
* event_store_events
* event_store_events_in_streams
These live in public or a dedicated event_store schema.

## 6. Per-Module Database Schemas
We use:
* One database
* One schema per module, e.g.:
    * users
    * events
    * analytics

Example migration

```ruby
```ruby
class CreateUsersSchemaAndTable < ActiveRecord::Migration[7.1]
  def change
    execute "CREATE SCHEMA IF NOT EXISTS users"

    create_table "users.users", id: :uuid, default: "gen_random_uuid()" do |t|
      t.string  :email,  null: false
      t.string  :name,   null: false
      t.boolean :active, null: false, default: true
      t.timestamps
    end
  end
end
```

## 7. Use Cases (Application Layer)
Use cases expose a Request / Response API.
```ruby
```ruby
module Users
  module UseCases
    class RegisterUser
      Request  = Data.define(:email, :name)
      Response = Data.define(:id, :email, :name)

      def call(request)
        user = nil

        ActiveRecord::Base.transaction do
          user = Users::User.create!(
            email: request.email,
            name:  request.name
          )

          Rails.configuration.event_store.publish(
            Users::Events::UserRegistered.new(data: { user_id: user.id })
          )
        end

        Response.new(id: user.id, email: user.email, name: user.name)
      end
    end
  end
end
```

## 8. HTTP Layer
Controllers:
* Map HTTP → Use Case → Response DTO → JSON
* Never talk to AR or RES directly.

```ruby
class Api::V1::Users::RegistrationsController < ApplicationController
  def create
    request_dto = Users::UseCases::RegisterUser::Request.new(
      email: params.require(:email),
      name:  params.require(:name)
    )

    response_dto = Users::UseCases::RegisterUser.new.call(request_dto)

    render json: response_dto, status: :created
  end
end
```

## 9. Async Handling
Three modes:
1. Inline (synchronous): simplest
2. Async same-process using ActiveJob :async
3. Async worker processes via Sidekiq/GoodJob/etc.

Subscriber example:
```ruby
Rails.configuration.event_store.subscribe(
  ->(event) { Analytics::TrackSignupJob.perform_later(event.event_id) },
  to: [Integration::Events::Users::UserRegistered]
)
```

## 10. Game Plan: Adding a New Entity
Example: add Users::Profile.
1. Create migration
2. Create AR model app/domains/users/domain/profile.rb
3. Add use cases if needed
4. Add handlers/events if needed
5. Add controller endpoints if needed

## 11. Game Plan: Adding a New Module
Example: new module Billing.
1. Create folder app/domains/billing
2. Add migration path in config/application.rb
3. Create DB schema & tables under db/billing_migrate
4. Add AR models under billing/domain
5. Add use cases under billing/use_cases
6. Add domain events under billing/events
7. Add mapping to integration events under billing/handlers
8. Add API layer under controllers/api/v1/billing
