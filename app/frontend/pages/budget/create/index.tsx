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
import { DraggableTree, DraggableTreeItem, DraggableTreeProps } from '@/components/Draggable-tree'
import { Circle } from 'lucide-react'
import { BudgetItemTable, BudgetItemTableProps } from '@/components/budget/BudgetItemTable'
import { BudgetItem, BudgetItemRequest } from '@/types/budget/BudgetItem'
import { CreateBudgetItemPopUp, CreateBudgetItemPopUpProps } from '@/components/budget/CreateBudgetItemPopUp'

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

type CreateBudgetFormDataType = {
  name: string,
  items: BudgetItemRequest[],
  categories: BudgetCategory[]

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
  const [items, setItems] = useState<BudgetItem[]>([])
  const currentId = useRef<number>(0)
  const [categoryTree, setCategoryTree] = useState<TreeDataItem[]>([])
  const [flattenedCategoryTree, setFlattenedCategoryTree] = useState<BudgetCategory[]>([])
  const [pendingCategoryName, SetPendingCategoryName] = useState<string>("")

  const form = useForm<CreateBudgetFormDataType>({
    name: '',
    categories: [],
    items: []
  })

  function AddItem(item: BudgetItem) {
    setItems(prev => [...prev, item])
  }
  useEffect(() => {
    console.log(default_categories)
    let tree: TreeDataItem[] = []
    for (const [key, value] of Object.entries(default_categories)) {
      tree.push({ name: value.name, id: value.id.toString(), draggable: true, droppable: true })
      currentId.current++
    }
    setCategoryTree(tree)
    var flattened = flattenTree(tree, null)
    setFlattenedCategoryTree(flattened)

  }, [default_categories])

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
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(flattenedCategoryTree)
    form.transform((data) => ({
      ...data,
      items: items.map(x => ({
        name: x.name,
        category_id: x.category_id,
        item_type: x.item_type,
        cadence: x.cadence,
        first_occurence: x.first_occurence,
        currency: x.currency,
        value: x.value
      })),
      categories: flattenedCategoryTree
    }))
    form.post('/budget/create', {
      preserveScroll: true,
    })
  }

  function AddPendingCategoryToTree(e) {
    e.preventDefault()
    let newNode: TreeDataItem = {
      name: pendingCategoryName,
      id: currentId.current.toString(),
      droppable: true,
      draggable: true
    }
    currentId.current++
    SetPendingCategoryName('')
    setCategoryTree(prev => {
      let newTree = [...prev, newNode]
      var flattened = flattenTree(newTree, null)
      setFlattenedCategoryTree(flattened)
      return newTree
    }
    )

  }

  function updateTree(treeItems: TreeDataItem[]) {
    setCategoryTree(treeItems)
    var flattened = flattenTree(treeItems, null)
    setFlattenedCategoryTree(flattened)
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
                <DraggableTree
                  localisedDeleteText={i18n_t(i18n, "common.delete")}
                  setData={updateTree}
                  data={categoryTree} />
              </FieldSet>
              <FieldSet>
                <FieldLegend>{budget_item_legend}</FieldLegend>
                <CreateBudgetItemPopUp
                  i18n={i18n}
                  onSubmit={AddItem}
                  cadenceTypes={["daglig", "ugentlig", "månedlig", "kvartalvis", "halvårlig", "årlig"]}
                  categories={flattenedCategoryTree}
                  itemTypes={["Fast udgift", "forbrugs mål"]} />
                <BudgetItemTable
                  data={items}
                  setData={setItems}
                  categories={flattenedCategoryTree}
                  i18n={i18n} />
              </FieldSet>
            </FieldSet>
            <Button disabled={form.processing} type="submit">{i18n_t(i18n, "common.create")}</Button>
          </FieldGroup>
        </form>
      </div>
    </div >
  )
}
