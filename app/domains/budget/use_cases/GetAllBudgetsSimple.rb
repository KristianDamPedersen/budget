
module Budget
  module UseCases
    class GetAllBudgetsSimple
      Request = Data.define(:paginate)
      Response= Data.define(:budgets, :totalEntries)
      def call(req)
        budgets = Domain::Budget.all.select(:id, :name)
        all = budgets.count(:id)
        Response.new(budgets: budgets.then(&req.paginate), totalEntries: all)
      end
    end
  end
end
