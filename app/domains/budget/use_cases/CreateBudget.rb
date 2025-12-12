module Budget
  module UseCases
    class CreateBudget
    Request = Data.define(:name, :owned_by)
      Response = Data.define(:name, :owned_by, :budget_categories)

      def call(request)
        budget = nil
        ActiveRecord::Base.transaction do
          budget = Budget::Domain::Budget.create!(name: request.name, owned_by: request.owned_by)
            I18n.t("budget.default_categories").each do |category|
            budget.budget_categories.create(name: category)
            end
        end
      end
    end
  end
end
