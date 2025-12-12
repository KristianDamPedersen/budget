
class Api::V1::Budget::CreateController < ActionController::API
  around_action :switch_locale
  def create
    request_dto = Budget::UseCases::CreateBudget::Request.new(
      name: params.require(:name),
      owned_by: params.require(:owned_by)
    )
    response_dto = Budget::UseCases::CreateBudget.new.call(request_dto)

    render json: response_dto, status: :created
  end

  private
  def switch_locale(&action)
    header_locale = request.env["HTTP_ACCEPT_LANGUAGE"]&.scan(/^[a-z]{2}/)&.first
    locale = header_locale.presence || I18n.default_locale
    I18n.with_locale(locale, &action)
  end
end
