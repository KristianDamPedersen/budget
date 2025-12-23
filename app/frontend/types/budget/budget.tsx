import { BudgetCategory } from "./BudgetCategory"
import { BudgetItem } from "./BudgetItem"

export type Budget = {
  name: string
  budgetCategories: BudgetCategory[]
  budgetItems: BudgetItem[]

}


export type BudgetSimple = {
  id: string
  name: string
}
