module Budget
  module Domain
    class BudgetCategory < ApplicationRecord
    self.table_name = "budgets.budget_categories"
    validates_presence_of :name
    belongs_to :budget
    belongs_to :category, optional: true, class_name: "BudgetCategory", foreign_key: "parent_category_id"
    has_many :child_categories, class_name: "BudgetCategory", foreign_key: "parent_category_id"
    end
  end
end
