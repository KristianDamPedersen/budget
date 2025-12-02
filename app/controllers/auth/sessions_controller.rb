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
      secure: request.ssl?,
      samesite: "lax"
    )

    # store_workos_session_id(auth_response.access_token)

    workos_user = auth_response.user
    Rails.logger.info("WorkOS callback: authenticated workos_user id=#{workos_user.id} email=#{workos_user.email}")
    user_response = Authentication::UseCases::CreateUser.new.call(
      Authentication::UseCases::CreateUser::Request.new(
        first_name: workos_user.first_name || workos_user.given_name || "",
        last_name: workos_user.last_name || workos_user.family_name || "",
        email: workos_user.email,
        provider: :workos,
        provider_uid: workos_user.id
      )

    )
    Rails.logger.info("WorkOS callback: created/upserted user_id=#{user_response.user_id}")

    signed_in_user = Authentication::UseCases::FetchUser.new.call(
      Authentication::UseCases::FetchUser::Request.new(user_id: user_response.user_id)
    )

    sign_in(signed_in_user)
    Rails.logger.info("WorkOS callback: signed in session user_id=#{session[:user_id]}")

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

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def store_workos_session_id(access_token)
    return if access_token.blank?

    decoded = JWT.decode(access_token, nil, false).first
    session_id = decoded["sid"]

    if session_id.present?
      Rails.logger.info("WorkOS callback: storing session_id=#{session_id}")
      session[:workos_session_id] = session_id
    else
      Rails.logger.warn("WorkOS callback: access token missing sid claim")
    end
  rescue JWT::DecodeError => e
    Rails.logger.warn("WorkOS callback: failed to decode access token for logout sid: #{e.message}")
  end

  # FIX: DOCS before flight
  def logout_return_url
    "#{request.base_url}#{root_path}"
  end

  # FIX: DOCS before flight
  def inertia_request?
    request.headers["X-Inertia"].present?
  end
end
