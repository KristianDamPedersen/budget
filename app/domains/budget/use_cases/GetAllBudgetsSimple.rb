
module Budget
  module UseCases
    class GetAllBudgetsSimple
      Request = Data.define(:paginate)
      Response= Data.define(:budgets, :totalEntries)
      def call(req)
        budgets = Domain::Budget.all.select(:name)
        all = budgets.count
        Response.new(budgets: budgets.then(&req.paginate), totalEntries: all)
      end
    end
  end
end
