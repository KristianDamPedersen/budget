class Api::V1::BudgetController < InertiaController
  self.inertia_i18n_scopes = [ "common", "entities.budget_item", "entities.category", "components.create_budget_item_popup" ]
    def create_page
      render inertia: "budget/create/index", props: {
        title: I18n.t("pages.budget.create.title"),
        name_field_legend: I18n.t("pages.budget.create.name_field_legend"),
        name_field_description: I18n.t("pages.budget.create.name_field_description"),
        name_field_placeholder: I18n.t("pages.budget.create.name_field_placeholder"),
        category_field_legend: I18n.t("pages.budget.create.category_field_legend"),
        category_field_placeholder: I18n.t("pages.budget.create.category_field_placeholder"),
        category_field_description: I18n.t("pages.budget.create.category_field_description"),
        default_categories: I18n.t("entities.budget.default_categories"),
      budget_item_legend: I18n.t("entities.budget_item.plural")
    }
    end

  def create
    req = Budget::UseCases::CreateBudget::Request.new(
      name: budget_params[:name],
      owned_by:  "6658b89c-74aa-444c-95c9-acae486df11c",
      categories: budget_params[:categories].to_h,
    )

   Budget::UseCases::CreateBudget.new.call(req)


    # choose where to go next:
  rescue ActiveRecord::RecordInvalid => e
    # Inertia-friendly: send validation errors back
    redirect_back(
      fallback_location: "/budget/create",
      inertia: { errors: e.record.errors.to_hash(true) }
    )
  end

  private

  def budget_params
  params.require(:budget).permit(:name, categories: {})
  end
end
