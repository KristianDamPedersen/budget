module Authentication
  module UseCases
    # FIX: DOCS before flight
    # FIX: TESTS before flight
    class FetchUser
      # FIX: DOCS before flight
      # FIX: TESTS before flight
      Request = Data.define(:user_id)

      # FIX: DOCS before flight
      # FIX: TESTS before flight
      def call(request)
        Authentication::Domain::User.find(request.user_id)
      end
    end
  end
end
