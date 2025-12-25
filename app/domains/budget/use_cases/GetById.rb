
module Budget
  module UseCases
    class GetById
      Request = Data.define(:id)
      Response = Data.define(:name, :budgetCategories, :budgetItems)
      def call(request)
        budget = Domain::Budget.find(request.id)
            items = budget.budget_items.map do |item|
              cadence_key =
                Budget::Domain::BudgetItem::INTERVAL_TO_CADENCE_KEY.fetch(item.cadence) do
                  raise "Unknown cadence interval: #{item.cadence.inspect} for item_id=#{item.id}"
                end

              {
                id: item.id,
                name: item.name,
                item_type: item.item_type,
                cadence: cadence_key,
                first_occurence: item.first_occurence,
                currency: item.currency,
                value: item.value,
                category_id: item.category_id
              }
        end
        Response.new(name: budget.name, budgetCategories: budget.budget_categories, budgetItems: items)
      end
    end
  end
end
