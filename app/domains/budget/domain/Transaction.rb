module Budget
  module Domain
    class Transaction < ApplicationRecord
    self.table_name = "budgets.transactions"
      validates_presence_of :happened_at, :amount, :currency
      belongs_to :budget_item_occurence
    end
  end
end
