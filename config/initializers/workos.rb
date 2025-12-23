WorkOS.configure do |config|
  config.key = ENV.fetch("WORKOS_API_KEY")
end

# In dev only, you can disable SSL verification if your local trust store is broken.
# Do NOT enable this in production.
if Rails.env.development?
  module WorkOS
    module Client
      def client
        Net::HTTP.new(WorkOS.config.api_hostname, 443).tap do |http_client|
          http_client.use_ssl = true
          http_client.verify_mode = if ENV["WORKOS_SSL_NO_VERIFY"] == "1"
            OpenSSL::SSL::VERIFY_NONE
          else
            OpenSSL::SSL::VERIFY_PEER
          end
          http_client.open_timeout = WorkOS.config.timeout
          http_client.read_timeout = WorkOS.config.timeout
          http_client.write_timeout = WorkOS.config.timeout if RUBY_VERSION >= "2.6.0"
        end
      end
    end
  end
end
