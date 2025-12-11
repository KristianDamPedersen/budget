module Budget
  module Domain
    class BudgetItemOccurence < ApplicationRecord
      self.table_name = "budgets.budget_item_occurences"
      belongs_to :budget_item
      validates_presence_of :occured_on, :currency, :value, :created_at, :updated_at
      has_many :transactions
    end
  end
end
