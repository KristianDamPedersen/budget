module Budget
  module UseCases
    class GetAllPendingItemsForBudgetAndDateDate
      Request = Data.define(:id, :date)
      Response = Data.define(:PendingItems)
      def call(request)
        budget = Domain::Budget.find(request.id)
            items = []
        budget.budget_items.map do |item|
          addItem = false
          case item.cadence
          when "monthly"
            addItem =  true
          when "quarterly"
            if _check_interval_match(item.first_occurence.mon, date.mon, 3)
              addItem = true
            end
          when "biannual"
            if _check_interval_match(item.first_occurence.mon, date.mon, 6)
              addItem = true
            end
          when "yearly"
            if _check_interval_match(item.first_occurence.mon, date.mon, 122)
              addItem = true
            end
          end
        end
        Response.new(id: budget.id, name: budget.name, budgetCategories: budget.budget_categories, budgetItems: items)
      end
    end

    def _get_wrapped_addition(month, numberOfMonthsToAdd)
      unwrapped = month + numberOfMonthsToAdd
      if unwrapped > 12
        (unwrapped  - 12)
      unwrapped
      end
    end


    def _check_interval_match(firstOccurenceMonth, currentMonth, intervalInMonths)
      if 12 % intervalInMonths > 0
        raise "Unsupported month interval, 12 must be divisible by the interval for now"
      end
      iterations = (12 / intervalInMonths) - 1
    (0..iterations).each do |i|
        if _get_wrapped_addition(firstOccurence, i*intervalInMonths) == currentMonth
          true
        end
      end
      false
    end
  end
end
