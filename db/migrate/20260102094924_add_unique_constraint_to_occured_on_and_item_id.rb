class AddUniqueConstraintToOccuredOnAndItemId < ActiveRecord::Migration[8.1]
  def change
    add_index "budgets.budget_item_occurences",
              [ :budget_item_id, :occured_on ],
              unique: true,
              name: "idx_budget_item_occ_uniq"
  end
end
