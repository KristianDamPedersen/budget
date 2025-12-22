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
end
