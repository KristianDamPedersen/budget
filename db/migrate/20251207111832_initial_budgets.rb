class InitialBudgets < ActiveRecord::Migration[8.1]
  def change
    execute "CREATE SCHEMA IF NOT EXISTS budgets"

    create_table "budgets.budgets", id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :name, null: false
      t.uuid :owned_by, null: false
      t.timestamps
    end

    create_table "budgets.budget_items", id: :uuid, default: "gen_random_uuid()" do |t| 
      t.references :budget_id, null: false
      
      t.timestamps
    end
    add_foreign_key  "budgets.budget_items", "budgets.budgets", column: :budget_id
  end

end
