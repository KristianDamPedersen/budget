
import { BudgetItemTable } from '@/components/budget/BudgetItemTable'
import { CreateBudgetItemPopUp } from '@/components/budget/CreateBudgetItemPopUp'
import { NavBar } from '@/components/nav-bar'
import { TreeDataItem } from '@/components/tree-view'
import { BudgetCategoriesToTree, TreeWithOptionToEdit } from '@/components/TreeWithOptionToEdit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { i18n_t, I18nNode } from '@/lib/utils'
import { Budget } from '@/types/budget/budget'
import { BudgetCategory } from '@/types/budget/BudgetCategory'
import { BudgetItem, BudgetItemRequest } from '@/types/budget/BudgetItem'
import { useForm, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export type SingleBudgetPageProps = {
  budget: Budget
  cadences: string[],
  item_types: string[]
  i18n: I18nNode
}
export default function SingleBudgetPage() {
  const { budget, i18n, item_types, cadences } = (usePage().props as unknown) as SingleBudgetPageProps

  const [items, setItems] = useState<BudgetItemRequest[]>([])
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [pendingCategory, setPendingCategory] = useState<string>("")
  const [categoryTree, setCategoryTree] = useState<TreeDataItem[]>([])

  useEffect(() => {
    setItems(budget.budgetItems)
    setCategories(budget.budgetCategories)
    setCategoryTree(BudgetCategoriesToTree(budget.budgetCategories))
  }, [])
  function flattenTree(elements: TreeDataItem[], parentId: string | null): BudgetCategory[] {
    // walks the root elements
    let items: BudgetCategory[] = []
    for (let i = 0; i < elements.length; i++) {
      items.push({ id: elements[i].id, name: elements[i].name, parent_id: parentId })
      if (elements[i].children != undefined && elements[i].children!.length > 0) {
        items.push(...flattenTree(elements[i].children!, elements[i].id))
      }
    }
    return items
  }
  type UpdateBudgetFormDataType = {
    name: string,
    items: BudgetItemRequest[],
    categories: BudgetCategory[]

  }

  function handleSave(tree: TreeDataItem[]) {
    setCategoryTree(tree)
    console.log("saving....")
    let newCategories = flattenTree(tree, null)
    console.log(newCategories)
    setCategories(newCategories)
  }
  function handleSubmit() {
    fetch(`/budget/${budget.id}`, {
      method: "PUT", // or PATCH (Rails convention)
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content"),
      },
      body: JSON.stringify({
        budget: {
          name: budget.name,
          items: items,
          categories: categories,
        },
      }),
    }).then(async (res) => {
      if (!res.ok) {
        console.log("status", res.status);
        console.log(await res.text());
      }
    });
  }
  return (
    <div>
      <NavBar />
      <div className='py-4 px-2'>
        <div className='grid grid-cols-5'>
          <h1 className="text-4xl col-start-1">{budget.name}</h1>
          <Button
            className="col-start-4"
            onClick={() => handleSubmit()}>
            {i18n_t(i18n, "common.save")}
          </Button>
        </div>
        <div className='py-8'>
          <TreeWithOptionToEdit
            items={categoryTree}
            title={i18n_t(i18n, "entities.category.plural")}
            localizedDeleteText={i18n_t(i18n, "common.delete")}
            i18n={i18n}
            onSave={(items) => handleSave(items)}
            renderEditHeader={({ addRoot }) => (
              <div className="flex gap-2 mb-4 max-w-md">
                <Input
                  value={pendingCategory}
                  onChange={(e) => setPendingCategory(e.target.value)}
                  placeholder={`${i18n_t(i18n, "entities.category.label")} ${i18n_t(i18n, "common.name")}...`}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!pendingCategory.trim()) return
                    addRoot({ id: crypto.randomUUID(), name: pendingCategory.trim(), draggable: true, droppable: true })
                    setPendingCategory("")
                  }}
                >
                  {i18n_t(i18n, "common.add")}
                </Button>
              </div>
            )}
          />
        </div>
        <div className='py-8 '>
          <div className="grid grid-cols-4">
            <h2 className="col-start-1 col-span-3 text-2xl mb-2">{i18n_t(i18n, "entities.budget_item.plural")}</h2>
            <CreateBudgetItemPopUp
              itemTypes={item_types}
              categories={categories}
              i18n={i18n}
              cadenceTypes={cadences}
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

