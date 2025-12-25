class Api::V1::BudgetController < InertiaController
  include Pagination
  self.inertia_i18n_scopes = [
    "common",
    "entities.budget_item",
    "entities.category",
    "components.create_budget_item_popup",
    "components.currency_input"
   ]
   def create_page
      cadences =
        I18n.t("entities.budget_item.cadences")
        .keys
    item_types = I18n.t("entities.budget_item.item_types").keys
      render inertia: "budget/create/index", props: {
        title: I18n.t("pages.budget.create.title"),
        name_field_legend: I18n.t("pages.budget.create.name_field_legend"),
        name_field_description: I18n.t("pages.budget.create.name_field_description"),
        name_field_placeholder: I18n.t("pages.budget.create.name_field_placeholder"),
        category_field_placeholer: I18n.t("pages.budget.create.category_field_placeholder"),
        category_field_description: I18n.t("pages.budget.create.category_field_description"),
        default_categories: I18n.t("entities.budget.default_categories"),
        budget_item_legend: I18n.t("entities.budget_item.plural"),
        cadences: cadences,
        item_types: item_types
    }
   end
  def index
    req = Budget::UseCases::GetAllBudgetsSimple::Request.new(paginate)
    budgets = Budget::UseCases::GetAllBudgetsSimple.new.call(req)
    render inertia: "budget/index", props: {
      title: I18n.t("pages.budget.index.title"),
      budgets: budgets.budgets,
      perPage: per_page,
      pageNo: page_no,
      locale: I18n.locale,
      totalPages: (budgets.totalEntries.to_f/per_page).ceil

    }
  end

  def byId
      cadences =
        I18n.t("entities.budget_item.cadences")
        .keys
    item_types = I18n.t("entities.budget_item.item_types").keys
    req = Budget::UseCases::GetById::Request.new(params[:id])
    budget =  Budget::UseCases::GetById.new.call(req)
    render inertia: "budget/single/index", props: {
      budget: budget,
      item_types: item_types,
      cadences: cadences
    }
  end
  def create
    req = Budget::UseCases::CreateBudget::Request.new(
      name: budget_params[:name],
      owned_by:  "6658b89c-74aa-444c-95c9-acae486df11c",
      categories: budget_params[:categories],
      items: budget_params[:items]
    )

   Budget::UseCases::CreateBudget.new.call(req)
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("RecordInvalid: #{e.record.class} #{e.record.errors.full_messages.join(", ")}")

    redirect_back(
      fallback_location: "/budget/create",
      inertia: { errors: e.record.errors.to_hash(true) }
    )
  end
  private
def update
  req = Budget::UseCases::UpdateBudget::Request.new(
    budget_id: params[:id],
    name: budget_params[:name],
    owned_by: "6658b89c-74aa-444c-95c9-acae486df11c",
    categories: budget_params[:categories],
    items: budget_params[:items]
  )

  Budget::UseCases::UpdateBudget.new.call(req)

  # redirect or render inertia props as you prefer
rescue ActiveRecord::RecordInvalid => e
  Rails.logger.error("RecordInvalid: #{e.record.class} #{e.record.errors.full_messages.join(", ")}")
  redirect_back(
    fallback_location: "/budget/#{params[:id]}",
    inertia: { errors: e.record.errors.to_hash(true) }
  )
end
  def budget_params
   params.require(:budget).permit(
    :name,
    categories: [ :id, :name, :parent_id ],
    items: [ :id, :budget_id, :name, :category_id, :item_type, :cadence, :value, :currency, :first_occurence ]
  )
  end
end
