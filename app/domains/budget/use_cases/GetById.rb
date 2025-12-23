
module Budget
  module UseCases
    class GetById
      Request = Data.define(:id)
      Response = Data.define(:name, :budgetCategories, :budgetItems)
      def call(request)
        budget = Domain::Budget.find(request.id)
        Response.new(name: budget.name, budgetCategories: budget.budget_categories, budgetItems: budget.budget_items)
      end
    end
  end
end
