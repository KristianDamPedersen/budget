export type BudgetItem = {
  budget_id: string,
  name: string,
  created_by: string,
  category_id: string | number,
  item_type: string,
  cadence: string,
  first_occurence: Date,
  currency: string,
  value: number,
  created_at: Date,
  updated_at: Date

}

export type BudgetItemRequest = {
  name: string,
  category_id: string,
  item_type: string,
  cadence: string,
  first_occurence: Date,
  currency: string,
  value: number
}
