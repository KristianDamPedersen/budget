import { useEffect, useState } from "react"
import { TreeDataItem, TreeRenderItemParams, TreeView } from "./tree-view"
import { Button } from "./ui/button"
import { DraggableTree } from "./Draggable-tree"
import { i18n_t, I18nNode } from "@/lib/utils"
import { CircleX, PencilIcon } from "lucide-react"
import { BudgetCategory } from "@/types/budget/BudgetCategory"

export type TreeWithOptionToEditProps = {
  title: string
  localizedDeleteText: string
  items: TreeDataItem[]
  onSave: (items: TreeDataItem[]) => void
  i18n: I18nNode
}

export function BudgetCategoriesToTree(
  categories: BudgetCategory[],
  opts?: {
    // Optional: fill extra TreeDataItem fields (icons, actions, handlers, etc.)
    mapNode?: (c: BudgetCategory) => Omit<TreeDataItem, "children">
    // Optional: control ordering among siblings
    sortChildren?: (a: TreeDataItem, b: TreeDataItem) => number
  }
): TreeDataItem[] {
  const mapNode =
    opts?.mapNode ??
    ((c) => ({
      id: c.id.toString(),
      name: c.name,
    }))

  const byId = new Map<string, TreeDataItem>()
  const roots: TreeDataItem[] = []

  // 1) Create all nodes (no parent wiring yet)
  for (const c of categories) {
    byId.set(c.id.toString(), { ...mapNode(c), children: [] })
  }

  // 2) Wire children to parents (or to roots)
  for (const c of categories) {
    const node = byId.get(c.id.toString())
    if (!node) continue

    const parentId = c.parent_id
    if (!parentId) {
      roots.push(node)
      continue
    }

    const parent = byId.get(parentId)
    if (!parent) {
      // parent missing -> treat as root (or collect separately)
      roots.push(node)
      continue
    }

    parent.children ??= []
    parent.children.push(node)
  }

  // 3) Clean up empty children arrays + sort if desired
  const sortChildren = opts?.sortChildren
  const prune = (n: TreeDataItem): TreeDataItem => {
    if (n.children && n.children.length > 0) {
      if (sortChildren) n.children.sort(sortChildren)
      n.children = n.children.map(prune)
    } else {
      delete n.children
    }
    return n
  }

  const tree = roots.map(prune)
  if (sortChildren) tree.sort(sortChildren)
  return tree
}


export function TreeWithOptionToEdit(Props: TreeWithOptionToEditProps) {
  const { onSave, title, items, i18n, localizedDeleteText } = Props
  const [pendingData, setPendingData] = useState<TreeDataItem[]>(items)
  const [isEditing, setIsEditing] = useState(false)

  function StopEditing(shouldSave: boolean) {
    if (shouldSave) {
      onSave(pendingData)
    }

    setPendingData(items)
    setIsEditing(false)
  }

  function StartEditing() {
    var arr = items
    for (let item of arr) {
      item.draggable = true
      item.droppable = true
    }
    setPendingData(arr)
    setIsEditing(true)


  }


  return (
    <>
      <h1 className="text-2xl">{title}</h1>
      {isEditing ? (
        <div className="flex-col mt-4">
          <Button onClick={() => StopEditing(false)}>
            <span>
              <CircleX />
            </span>{i18n_t(i18n, "common.cancel")}</Button>
          <DraggableTree
            data={pendingData}
            setData={setPendingData}
            localisedDeleteText={localizedDeleteText}>
          </DraggableTree>
          <Button onClick={() => { StopEditing(true) }}>{i18n_t(i18n, "common.save")}</Button>
        </div >
      ) : (
        <div className="flex-col">
          <Button onClick={() => StartEditing()}>
            <span>
              <PencilIcon />
            </span>{i18n_t(i18n, "common.edit")}</Button>
          <TreeView
            data={items}
            renderItem={
              (renderParams: TreeRenderItemParams) => (
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="truncate">{renderParams.item.name}</span >
                </div >

              )
            }
          />
        </div>

      )
      }
    </>

  )
}
