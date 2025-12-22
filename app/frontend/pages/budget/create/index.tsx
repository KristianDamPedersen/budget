import { Head } from '@inertiajs/react'
import { useForm, usePage } from '@inertiajs/react'
import { FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { i18n_t, I18nNode } from '@/lib/utils'
import { TreeDataItem, TreeView } from '@/components/tree-view'
import { set } from 'react-hook-form'
import { Separator } from '@radix-ui/react-separator'
import DraggableTree, { DraggableTreeHandle, DraggableTreeItem, DraggableTreeProps } from '@/components/Draggable-tree'
import { Circle } from 'lucide-react'
import { BudgetItemTable } from '@/components/budget/BudgetItemTable'
import { BudgetItem } from '@/types/budget/BudgetItem'
import { CreateBudgetItemPopUp } from '@/components/budget/CreateBudgetItemPopUp'

const budgetItems: BudgetItem[] = [
  {
    budget_id: "0",
    name: "Office Software Subscriptions",
    created_by: "user_123",
    category_id: 10,
    item_type: "expense",
    cadence: "monthly",
    first_occurence: new Date("2025-01-01"),
    currency: "USD",
    value: 89.99,
    created_at: new Date("2025-01-01T09:15:00Z"),
    updated_at: new Date("2025-01-01T09:15:00Z"),
  },
  {
    budget_id: "1",
    name: "Cloud Hosting Costs",
    created_by: "user_456",
    category_id: 20,
    item_type: "expense",
    cadence: "monthly",
    first_occurence: new Date("2025-02-01"),
    currency: "USD",
    value: 320.5,
    created_at: new Date("2025-02-01T10:30:00Z"),
    updated_at: new Date("2025-02-10T14:45:00Z"),
  },
  {
    budget_id: "2",
    name: "Consulting Income",
    created_by: "user_789",
    category_id: "income",
    item_type: "income",
    cadence: "quarterly",
    first_occurence: new Date("2025-01-15"),
    currency: "EUR",
    value: 4500,
    created_at: new Date("2025-01-15T08:00:00Z"),
    updated_at: new Date("2025-03-01T12:20:00Z"),
  },
]
export type BudgetCategory = {
  name: string
  parent_id: string | null
  id: string | number

}
type CreateBudgetProps = {
  title: string
  name_field_legend: string
  name_field_description: string
  name_field_placeholder: string
  category_field_legend: string
  category_field_placeholder: string
  category_field_description: string
  budget_item_legend: string
  i18n: I18nNode,
  default_categories: Record<string, BudgetCategory>
}


export default function CreateBudget() {
  const { name_field_legend,
    name_field_description,
    title,
    name_field_placeholder,
    i18n,
    default_categories,
    category_field_placeholder,
    category_field_legend,
    category_field_description,
    budget_item_legend } = (usePage().props as unknown) as CreateBudgetProps

  const currentId = useRef<number>(0)
  const [categoryTree, setCategoryTree] = useState<DraggableTreeItem[]>([])
  const treeRef = useRef<DraggableTreeHandle>(null)
  const [pendingCategoryName, SetPendingCategoryName] = useState<string>("")
  const form = useForm({
    name: '',
    categories: default_categories
  })


  useEffect(() => {
    console.log(default_categories)
    let tree: DraggableTreeItem[] = []

    for (const [key, value] of Object.entries(default_categories)) {
      tree.push({ name: value.name, id: value.id.toString() })
    }
    setCategoryTree(tree)

  }, [default_categories])
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.post('/budget/create', {
      preserveScroll: true,
    })
  }

  function AddPendingCategoryToTree(e) {
    e.preventDefault()
    let tree = categoryTree
    let newNode: DraggableTreeItem = {
      name: pendingCategoryName,
      id: currentId.current.toString(),
    }
    currentId.current++
    tree.push(newNode)
    SetPendingCategoryName("")
    treeRef.current?.addRoot(newNode.name, newNode.id)
    console.log(treeRef.current?.getTree())
  }
  return (
    <div>
      <div className="flex flex-col gap-y-6 m-md px-4 pb-4 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>{name_field_legend}</FieldLegend>
              <FieldDescription>{name_field_description}</FieldDescription>
              <Input
                onChange={(e) => form.setData('name', e.target.value)}
                placeholder={name_field_placeholder}
                required
              />
              <FieldSet>
                <FieldLegend>{category_field_legend}</FieldLegend>
                <FieldDescription>{category_field_description}</FieldDescription>
                <Input onChange={(e) => SetPendingCategoryName(e.target.value)}
                  placeholder={category_field_placeholder}
                  value={pendingCategoryName}
                ></Input>
                <Button onClick={AddPendingCategoryToTree}>{i18n_t(i18n, "common.add")}</Button>
                <DraggableTree ref={treeRef} data={categoryTree} i18n={i18n} />
              </FieldSet>
              <FieldSet>
                <FieldLegend>{budget_item_legend}</FieldLegend>
                <CreateBudgetItemPopUp i18n={i18n} categories={categoryTree ?? []} />
                <BudgetItemTable data={budgetItems} i18n={i18n} />
              </FieldSet>
            </FieldSet>
            <Button disabled={form.processing} type="submit">{i18n_t(i18n, "common.create")}</Button>
          </FieldGroup>
        </form>
      </div>
    </div >
  )
}
