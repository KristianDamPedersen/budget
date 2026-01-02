
module Budget
  module UseCases
    class DeleteBudget
      Request = Struct.new(
        :id,
      )
      def call(req)
        budget = ::Budget::Domain::Budget.find(req.id)
        budget.budget_items.each do |item|
          item.destroy()
        end
        budget.budget_categories.each do |cat|
          cat.destroy()
        end
        budget.destroy()
      end
    end
  end
end
