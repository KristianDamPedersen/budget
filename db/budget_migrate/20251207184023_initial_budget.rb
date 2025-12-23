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


      t.references :budget,
                   type: :uuid,
                   null: false,
                   foreign_key: { to_table: "budgets.budgets" }

      t.references :parent_category,
                   type: :uuid,
                   foreign_key: { to_table: "budgets.budget_categories" }

      t.timestamps
    end

    create_table "budgets.budget_items", id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :name, null: false
      t.uuid :created_by, null: false

      t.references :budget,
                   type: :uuid,
                   null: false,
                   foreign_key: { to_table: "budgets.budgets" }

      t.references :budget_category,
                   type: :uuid,
                   null: false,
                   foreign_key: { to_table: "budgets.budget_categories" }

      t.string :item_type, null: false

      t.interval :cadence, null: false
      t.datetime :first_occurence, null: false
      t.string :currency, null: false
      t.decimal :value, precision: 10
      t.timestamps
    end

    create_table "budgets.budget_item_occurences", id: :uuid, default: "gen_random_uuid()" do |t|
      # budget_item_id -> budgets.budget_items
      t.references :budget_item,
                   type: :uuid,
                   null: false,
                   foreign_key: { to_table: "budgets.budget_items" }

      t.datetime :occured_on, null: false
      t.string :currency, null: false
      t.decimal :value, null: false
      t.timestamps
    end

    create_table "budgets.transactions", id: :uuid, default: "gen_random_uuid()" do |t|
      # budget_item_occurence_id -> budgets.budget_item_occurences
      t.references :budget_item_occurence,
                   type: :uuid,
                   null: false,
                   foreign_key: { to_table: "budgets.budget_item_occurences" }

      t.datetime :happened_at, null: false
      t.decimal :amount, precision: 10, null: false
      t.string :currency
      t.timestamps
    end
  end
end
