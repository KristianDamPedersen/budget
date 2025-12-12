require "jwt"

class Auth::SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :callback

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def new
    state = SecureRandom.hex(24)
    session[:workos_state] = state

    authorization_url = WorkOS::UserManagement.authorization_url(
      provider: "authkit",
      client_id: ENV["WORKOS_CLIENT_ID"],
      redirect_uri: ENV.fetch("WORKOS_REDIRECT_URI"),
      state: state
    )

    redirect_to authorization_url, allow_other_host: true
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def callback
    unless params[:state].present? && params[:state] == session.delete(:workos_state)
      Rails.logger.warn("WorkOS callback: invalid state param=#{params[:state].inspect}")
      return redirect_to root_path, alert: "Invalid login state"
    end

    if params[:code].blank?
      Rails.logger.warn("WorkOS callback: missing code")
      return redirect_to root_path, alert: "Missing code"
    end

    auth_response = WorkOS::UserManagement.authenticate_with_code(
      client_id: ENV.fetch("WORKOS_CLIENT_ID"),
      code: params[:code],
      session: {
        seal_session: true,
        cookie_password: ENV["WORKOS_COOKIE_PASSWORD"]
      }
    )

    store_workos_session_id(auth_response.access_token)
    response.set_cookie(
      "wos_session",
      value: auth_response.sealed_session,
      httponly: true,
      secure: workos_cookie_secure?,
      samesite: "lax"
    )

    # store_workos_session_id(auth_response.access_token)

    workos_user = auth_response.user

    # Check for email verifiaction before we create the user in the database
    unless workos_user.respon_to?(:email_verified) && workos_user.email_verified
      return redirect_to root_path, alert: "Email is not verified"
    end

    Rails.logger.info("WorkOS callback: authenticated WorkOS user")

    # Post authentication we fetch or initialize the user in the app database.
    user_response = Authentication::UseCases::CreateUser.new.call(
      Authentication::UseCases::CreateUser::Request.new(
        first_name: workos_user.first_name || workos_user.given_name || "",
        last_name: workos_user.last_name || workos_user.family_name || "",
        email: workos_user.email,
        provider: :workos,
        provider_uid: workos_user.id
      )
    )

    Rails.logger.info("WorkOS callback: user record persisted")

    signed_in_user = Authentication::UseCases::FetchUser.new.call(
      Authentication::UseCases::FetchUser::Request.new(user_id: user_response.user_id)
    )

    # Sign in the app user
    sign_in(signed_in_user)
    Rails.logger.info("WorkOS callback: user signed in")

    redirect_to root_path, notice: "Signed in"

  rescue StandardError => e
    Rails.logger.error("WorkOS callback error: #{e.class}: #{e.message}")
    redirect_to root_path, alert: "Sign-in failed"
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def destroy
    workos_session_id = session[:workos_session_id]
    sign_out

    if workos_session_id.present?
      logout_url = WorkOS::UserManagement.get_logout_url(
        session_id: workos_session_id,
        return_to: logout_return_url
      )
      Rails.logger.info("WorkOS logout: redirecting to #{logout_url}")

      if inertia_request?
        response.set_header("X-Inertia-Location", logout_url)
        return head :conflict
      end

      return redirect_to logout_url, allow_other_host: true, status: :see_other
    end

    redirect_to root_path, notice: "Signed out", status: :see_other
  rescue StandardError => e
    Rails.logger.error("WorkOS logout error: #{e.class}: #{e.message}")
    redirect_to root_path, notice: "Signed out"
  end

  private

  WORKOS_JWKS_URI = URI("https://api.workos.com/user_management/jwks")
  WORKOS_ISS = "https://api.workos.com/user_management/#{ENV.fetch("WORKOS_CLIENT_ID")}"
  WORKOS_AUD = ENV.fetch("WORKOS_CLIENT_ID")

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def workos_jwks
    # fetch the jwks url
    jwks_url = WorkOS::UserManagement.get_jwks_url(ENV["WORKOS_CLIENT_ID"])
    Rails.logger.info("JWKS URL: #{jwks_url}")

    @workos_jwks ||= begin
      uri = URI(jwks_url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      if ENV["WORKOS_SSL_NO_VERIFY"] == "1"
        http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      else
        http.cert_store = OpenSSL::X509::Store.new.tap { |s| s.set_default_paths }
      end
      response = http.get(uri.request_uri)
      JWT::JWK::Set.new(JSON.parse(response.body))
    end
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def store_workos_session_id(access_token)
    return if access_token.blank?

    decoded, = JWT.decode(
      access_token,
      nil,
      true, # enable verification
      algorithms: [ "RS256" ],
      jwks: workos_jwks,
      iss: WORKOS_ISS,
      verify_iss: true,
      verify_aud: false
    )

    session_id = decoded["sid"]
    if session_id.present?
      Rails.logger.info("WorkOS callback: storing session_id=#{session_id}")
      session[:workos_session_id] = session_id
    else
      Rails.logger.warn("WorkOS callback: access token missing sid claim")
    end
  rescue JWT::DecodeError => e
    Rails.logger.warn("WorkOS callback: failed to verify access token for logout sid: #{e.message}")
  end

  # FIX: DOCS before flight
  def logout_return_url
    "#{request.base_url}#{root_path}"
  end

  # FIX: DOCS before flight
  def inertia_request?
    request.headers["X-Inertia"].present?
  end

  # FIX: DOCS before flight
  def workos_cookie_secure?
    return false if ENV["WORKOS_SSL_NO_VERIFY"] == "1"
    true
  end
end
