module Budget
  module Domain
    class Budget < ApplicationRecord
      self.table_name = "budgets.budgets"
      has_many :budget_categories, dependent: :destroy
      has_many :budget_items, dependent: :destroy
      validates_presence_of :name, :owned_by
    end
  end
end
