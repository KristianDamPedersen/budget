module Budget
  module UseCases
    class CreateMonthlyOccurences
      Request = Struct.new(
        :budget_id,
        :date
      )

      Result = Struct.new(:created_count)

      def call(req)
        budget = ::Budget::Domain::Budget.find(req.budget_id)

        month_start = req.date.to_date.beginning_of_month.in_time_zone
        month_end   = month_start.next_month

        created = 0

        ActiveRecord::Base.transaction do
          budget.budget_items.find_each do |item|
            due_dates = due_dates_for_month(item, month_start, month_end)
            next if due_dates.empty?

            # Fetch existing occurrences in the target month for this item
            existing = ::Budget::Domain::BudgetItemOccurence
              .where(budget_item_id: item.id, occured_on: month_start...month_end)
              .pluck(:occured_on)
              .to_set

            to_create = due_dates.reject { |dt| existing.include?(dt) }
            next if to_create.empty?

            rows = to_create.map do |dt|
              {
                budget_item_id: item.id,
                occured_on: dt,
                currency: item.currency,
                value: item.value,
                created_at: Time.current,
                updated_at: Time.current
              }
            end

            ::Budget::Domain::BudgetItemOccurence.insert_all(
              rows,
              unique_by: :idx_budget_item_occ_uniq
            )

            created += rows.length
          end
        end

        Result.new(created)
      end

      private
      def due_dates_for_month(item, month_start, month_end)
        anchor = item.first_occurence.in_time_zone

        return [] if anchor >= month_end

        # Start from the first occurrence on/after month_start:
        t = anchor
        if t < month_start
          t = advance_to_at_least(t, item.cadence, month_start)
        end

        dates = []
        while t < month_end
          dates << t
          t = t + item.cadence
        end

        dates
      end

      def advance_to_at_least(t, cadence, target)
        while t < target
          t = t + cadence
        end
        t
      end
    end
  end
end
