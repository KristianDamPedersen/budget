module Budget
  module UseCases
    class CreateBudget
       Request = Data.define(:name, :owned_by, :categories, :items)
      Response = Data.define(:name, :owned_by, :budget_categories, :items)
      INTERVAL_MAP = {
        0  => 1.days,
        1 => 1.weeks,
        2 => 1.months,
        3    => 3.months,
        4 => 6.months,
        5 => 1.years
      }.freeze
      def call(request)
        budget = nil
        categoryMap = {}
        ActiveRecord::Base.transaction do
          budget = Budget::Domain::Budget.create!(name: request.name, owned_by: request.owned_by)
          p request.categories
          request.categories.each do | category|
            cat = budget.budget_categories.create(name: category["name"])
            categoryMap[category["id"].to_s] = cat
            end

        request.categories.each do | category|
          next if category["parent_id"].nil?
          child = categoryMap[category["id"].to_s]
          parent = categoryMap[category["parent_id"].to_s]
          child.update!(parent_category_id: parent.id)
        end

        request.items.each do | item|
            cat = categoryMap[item["category_id"].to_s]

            raise "Unknown category_id #{item["category_id"]} (known: #{category_map.keys.join(", ")})" if cat.nil?
            Rails.logger.info "item cadence from request: #{item['cadence'].inspect}"
            Rails.logger.info "item cadence translated: #{INTERVAL_MAP[item['cadence']].inspect}"
            bi = budget.budget_items.new(
              name: item["name"],
              budget_category: cat,
              item_type: item["item_type"],
              cadence: INTERVAL_MAP[item["cadence"]],
              first_occurence: item["first_occurence"],
              currency: item["currency"],
              created_by: "7934de8e-c5a5-4f1d-86ad-0fe133f81f67",
              value: item["value"]
            )
            Rails.logger.info "item cadence from request: #{bi.cadence.inspect}"
          bi.save!
        end
        end
      end
    end
  end
end
