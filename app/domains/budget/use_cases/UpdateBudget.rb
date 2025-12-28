
module Budget
  module UseCases
    class UpdateBudget
      Request = Struct.new(
        :budget_id,
        :name,
        :categories,  # array of hashes
        :items,       # array of hashes
      )

      Result = Struct.new(:budget, keyword_init: true)

      def call(req)
        budget = ::Budget::Domain::Budget.find(req.budget_id)

        now = Time.current

        ::Budget::Domain::Budget.transaction do
          budget.update!(name: req.name) if req.name.present?

          incoming_ids = sync_categories!(budget: budget, incoming: Array(req.categories), now: now)
          sync_items!(budget: budget, incoming: Array(req.items), now: now)
        budget.budget_categories.where.not(id: incoming_ids).delete_all
        end

        Result.new(budget: budget.reload)
      end

      private

      # ---- Categories ----
      def sync_categories!(budget:, incoming:, now:)
        # Normalize and slice only allowed attrs (defensive)
        incoming = incoming.map do |c|
          {
            id: c[:id].presence,
            name: c[:name],
            parent_id: c[:parent_id]
          }
        end

        incoming_ids = incoming.filter_map { |c| c[:id] }

        # 1) delete all categories not present in request

        # split create vs update
        to_insert = incoming.select { |c| c[:id].blank? }.map do |c|
          {
            budget_id: budget.id,
            name: c[:name],
            parent_id: c[:parent_id],
            created_at: now,
            updated_at: now
          }
        end

        to_upsert = incoming.select { |c| c[:id].present? }.map do |c|
          {
            id: c[:id],
            budget_id: budget.id,  # ensures scoping; prevents “stealing” ids from other budgets
            name: c[:name],
            parent_category_id: c[:parent_id],
            updated_at: now
          }
        end

        # 2) create new
        budget.budget_categories.insert_all!(to_insert) if to_insert.any?

        budget.budget_categories.upsert_all(to_upsert, unique_by: :id) if to_upsert.any?
        incoming_ids
      end

      # ---- Items ----
      def sync_items!(budget:, incoming:, now:)
        incoming = incoming.map do |i|
          {
            id: i[:id].presence,
            name: i[:name],
            category_id: i[:category_id],
            item_type: i[:item_type],
            cadence: Domain::BudgetItem::CADENCE_KEY_TO_INTERVAL[i[:cadence]],
            first_occurence: i[:first_occurence],
            currency: i[:currency],
            value: i[:value],
            created_by: "31d011af-2784-4112-8d5f-1d5a1e249f30"
          }
        end

        incoming_ids = incoming.filter_map { |i| i[:id] }

        # 1) delete all items not present in request
        budget.budget_items.where.not(id: incoming_ids).delete_all

        to_insert = incoming.select { |i| i[:id].blank? }.map do |i|
          {
            budget_id: budget.id,
            name: i[:name],
            created_by: "31d011af-2784-4112-8d5f-1d5a1e249f30",
            category_id: i[:category_id],
            item_type: i[:item_type],
            cadence: i[:cadence],
            first_occurence: i[:first_occurence],
            currency: i[:currency],
            value: i[:value], created_at: now, updated_at: now } end

        to_upsert = incoming.select { |i| i[:id].present? }.map do |i|
          {
            id: i[:id],
            budget_id: budget.id,
            created_by: "31d011af-2784-4112-8d5f-1d5a1e249f30",
            name: i[:name],
            category_id: i[:category_id],
            item_type: i[:item_type],
            cadence: i[:cadence],
            first_occurence: i[:first_occurence],
            currency: i[:currency],
            value: i[:value],
            updated_at: now
          }
        end

        # 2) create new
        budget.budget_items.insert_all!(to_insert) if to_insert.any?

        # 3) update changed
        budget.budget_items.upsert_all(to_upsert, unique_by: :id) if to_upsert.any?
      end
    end
  end
end
