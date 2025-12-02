module Authentication
  module UseCases
    # FIX: DOCS before flight
    # FIX: TESTS before flight
    class CreateUser
      # FIX: DOCS before flight
      # FIX: TESTS before flight
      Request = Data.define(
        :first_name,
        :last_name,
        :email,
        :provider,
        :provider_uid
      )

      # FIX: DOCS before flight
      # FIX: TESTS before flight
      Response = Data.define(
        :user_id,
        :first_name,
        :last_name,
        :email,
        :provider,
        :provider_uid
      )

      # FIX: DOCS before flight
      # FIX: TESTS before flight
      def call(request)
        # Minimal normalization
        email = request.email.to_s.strip.downcase
        raise ArgumentError, "email required" if email.empty?

        user = Authentication::Domain::User.find_or_initialize_by(
          provider: request.provider,
          provider_uid: request.provider_uid
        )

        user.assign_attributes(
          first_name: request.first_name,
          last_name: request.last_name,
          email: email
        )

        user.save!

        Response.new(
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          provider: user.provider,
          provider_uid: user.provider_uid
        )
      end
    end
  end
end
