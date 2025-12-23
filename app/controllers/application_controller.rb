class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  helper_method :current_user, :signed_in?

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def current_user
    return @current_user if defined?(@current_user)

    user_id = session[:user_id]

    @current_user =
      if user_id.present?
        Authentication::UseCases::FetchUser.new.call(
          Authentication::UseCases::FetchUser::Request.new(user_id: user_id)
        )
      else
        nil
      end
  rescue ActiveRecord::RecordNotFound
    session.delete(:user_id)
    @current_user = nil
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def signed_in?
    current_user.present?
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def require_authentication
    return if signed_in?
    redirect_to auth_login_path, alert: "Please sign in"
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def sign_in(user)
    preserved_workos_sid = session[:workos_session_id]
    reset_session
    session[:workos_session_id] = preserved_workos_sid if preserved_workos_sid.present?
    session[:user_id] = user.id
  end

  # FIX: DOCS before flight
  # FIX: TESTS before flight
  def sign_out
    reset_session
  end
end
