
import { BudgetItemTable } from '@/components/budget/BudgetItemTable'
import { CreateBudgetItemPopUp } from '@/components/budget/CreateBudgetItemPopUp'
import { NavBar } from '@/components/nav-bar'
import { TreeDataItem } from '@/components/tree-view'
import { BudgetCategoriesToTree, TreeWithOptionToEdit } from '@/components/TreeWithOptionToEdit'
import { i18n_t, I18nNode } from '@/lib/utils'
import { Budget } from '@/types/budget/budget'
import { BudgetCategory } from '@/types/budget/BudgetCategory'
import { BudgetItem } from '@/types/budget/BudgetItem'
import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export type SingleBudgetPageProps = {
  budget: Budget
  i18n: I18nNode
}
export default function SingleBudgetPage() {
  const { budget, i18n } = (usePage().props as unknown) as SingleBudgetPageProps

  const [items, setItems] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [categoryTree, setCategoryTree] = useState<TreeDataItem[]>([])
  useEffect(() => {
    console.log(budget)
    setItems(budget.budgetItems)
    setCategories(budget.budgetCategories)
    console.log(budget.budgetCategories)
    setCategoryTree(BudgetCategoriesToTree(budget.budgetCategories))
  }, [])
  return (
    <div>
      <NavBar />
      <div className='py-4 px-2'>
        <h1 className="text-4xl">{budget.name}</h1>
        <div className='py-8'>
          <TreeWithOptionToEdit
            items={categoryTree}
            title={i18n_t(i18n, "entities.category.label")}
            localizedDeleteText={i18n_t(i18n, "common.delete")}
            i18n={i18n}
            onSave={(items) => { setCategoryTree(items) }}
          />
        </div>
        <div className='py-8 '>
          <div className="grid grid-cols-4">
            <h2 className="col-start-1 col-span-3 text-2xl mb-2">{i18n_t(i18n, "entities.budget_item.plural")}</h2>
            <CreateBudgetItemPopUp
              itemTypes={["fast udgift"]}
              categories={categories}
              i18n={i18n}
              cadenceTypes={["daglig"]}
              onSubmit={(item) => setItems(prev => [...prev, item])}>
            </CreateBudgetItemPopUp>
          </div>
          <BudgetItemTable
            data={items}
            setData={setItems}
            i18n={i18n}
            categories={categories}
          />
        </div>
      </div>
    </div>
  )
}

