module Authentication
  module Domain
    # FIX: DOCS before flight
    # FIX: TESTS before flight
    class User < ApplicationRecord
      self.table_name = "authentication.users"

      enum :provider, { workos: 0 }, prefix: true

      validates :provider, presence: true
      validates :email, presence: true
      validates :provider_uid, uniqueness: { scope: :provider }
    end
  end
end
