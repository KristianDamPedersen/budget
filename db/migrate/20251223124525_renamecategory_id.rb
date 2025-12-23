class RenamecategoryId < ActiveRecord::Migration[8.1]
  def change
    rename_column "budgets.budget_items", :budget_category_id, :category_id
  end
end
