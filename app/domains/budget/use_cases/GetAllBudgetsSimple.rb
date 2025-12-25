
module Budget
  module UseCases
    class GetAllBudgetsSimple
      Request  = Data.define(:paginate)
      Response = Data.define(:budgets, :totalEntries)

      def call(req)
        budgets = Domain::Budget
          .includes(:budget_items) # avoid N+1
          .select(:id, :name)

        total = budgets.count(:id)

        page = budgets.then(&req.paginate)

        mapped = page.map do |b|
          {
            id: b.id,
            name: b.name,
            items: b.budget_items.map do |item|
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
          }
        end

        Response.new(budgets: mapped, totalEntries: total)
      end
    end
  end
end
