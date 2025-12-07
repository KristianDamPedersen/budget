class InitialBudget < ActiveRecord::Migration[8.1]
  def change
    execute "CREATE SCHEMA IF NOT EXISTS budgets"
    create_table "budgets.budgets", id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :name, null: false
      t.uuid :owned_by, null: false
      t.timestamps
    end
    create_table "budgets.budget_categories", id: :uuid, default: "gen_random_uuid()" do |t|
        t.string :name, null: false
        t.references "budgets.budget_categories" 
        t.timestamps
    end
    create_table "budgets.budget_items", id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :name, null: false
      t.uuid :created_by, null: false
      t.references "budgets.budgets", type: :uuid, foreign_key: true, null: false
      t.references "budgets.budget_categories", type: :uuid, foreign_key:true, null: false
      t.string :type, null: false
      t.interval :cadence, null: false
      t.datetime :first_occurence, null: false
      t.string :currency, null: false
      t.decimal :value, precision: 10 
      t.timestamps
    end
    create_table "budgets.budget_item_occurences", id: :uuid, default: "gen_random_uuid()" do |t|
      t.references "budgets.budget_items", type: :uuid, foreign_key:true,null: false
      t.datetime :occured_on, null: false
      t.string :currency, null: false 
      t.decimal :value, null: false
      t.timestamps
    end
    create_table "budgets.transactions", id: :uuid, default: "gen_random_uuid()" do |t|
      t.references "budgets.budget_item_occurences", type: :uuid, foreign_key: true, null: false
      t.datetime :happened_at, null: false
      t.decimal :amount, precision: 10, null: false
      t.string :currency
      t.timestamps
    end 
  end
end
