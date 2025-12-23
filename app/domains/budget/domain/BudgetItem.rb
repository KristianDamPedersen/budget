module Budget
  module Domain
  class BudgetItem < ApplicationRecord
      self.table_name = "budgets.budget_items"
      validates_presence_of :name, :created_by, :item_type, :first_occurence, :currency, :cadence
      belongs_to :budget_category
      belongs_to :budget
      has_many :occurences, class_name: "BudgetItemOccurence"
  end
  end
  CADENCE_KEY_TO_INTERVAL = {
    "daily" => "1 day",
    "weekly" => "1 week",
    "monthly" => "1 month",
    "quarterly" => "3 months",
    "biannual" => "6 months",
    "yearly" => "1 year"
}.freeze

INTERVAL_TO_CADENCE_KEY =CADENCE_KEY_TO_INTERVAL.invert.freeze
end
