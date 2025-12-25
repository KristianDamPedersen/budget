module Budget
  module Domain
  class BudgetItem < ApplicationRecord
      self.table_name = "budgets.budget_items"
      validates_presence_of :name, :created_by, :item_type, :first_occurence, :currency, :cadence
      belongs_to :budget_category, foreign_key: :category_id
      belongs_to :budget
      has_many :occurences, class_name: "BudgetItemOccurence"

        CADENCE_KEY_TO_INTERVAL = {
              "daily" => 1.days,
              "weekly" => 7.days,
              "monthly" => 1.months,
              "quarterly" => 3.months,
              "biannual" => 6.months,
              "yearly" => 1.years
      }.freeze

        INTERVAL_TO_CADENCE_KEY =CADENCE_KEY_TO_INTERVAL.invert.freeze
  end
  end
end
