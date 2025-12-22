import React from "react"
import { TreeDataItem, TreeRenderItemParams, TreeView } from "./tree-view"
import { Button } from "./ui/button"
import { i18n_t, I18nNode } from "@/lib/utils"

export interface DraggableTreeItem {
  name: string
  id: string
}


export interface DraggableTreeProps {
  data: TreeDataItem[]
  setData: (data: TreeDataItem[]) => void
  localisedDeleteText: string
}

function cloneTree(items: TreeDataItem[]): TreeDataItem[] {
  return items.map((i) => ({
    ...i,
    children: i.children ? cloneTree(i.children) : undefined,
  }))
}

function findNode(items: TreeDataItem[], id: string): TreeDataItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findNode(item.children, id)
      if (found) return found
    }
  }
  return undefined
}
function removeNodeAndCollect(
  items: TreeDataItem[],
  id: string
): TreeDataItem[] {
  const deleted: TreeDataItem[] = []

  const walk = (arr: TreeDataItem[]) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const node = arr[i]

      if (node.id === id) {
        deleted.push(node)
        arr.splice(i, 1)          // remove from tree
        continue                  // don't walk its children (it's gone)
      }

      if (node.children?.length) walk(node.children)
    }
  }

  walk(items)
  return deleted
}

function addChild(tree: TreeDataItem[], parentId: string, child: TreeDataItem): TreeDataItem[] {
  const next = cloneTree(tree)
  console.log(tree)
  const parent = findNode(next, parentId)
  if (!parent) return next
  parent.children = parent.children ? [...parent.children, child] : [child]
  parent.droppable = true
  return next
}


export function DraggableTree(Props: DraggableTreeProps) {
  const { localisedDeleteText: localised_delete, data, setData } = Props
  return (
    <TreeView
      data={data}
      onDocumentDrag={(source, target) => {
        if (!target.id) return
        const next = cloneTree(data)
        const removed = removeNodeAndCollect(next, source.id)
        if (!removed) return next
        const tgt = findNode(next, target.id)
        if (!tgt) return next
        if (tgt.children != null) {
          tgt.children = tgt.children.concat(removed)
        } else {
          tgt.children = removed
        }
        tgt.droppable = true
        tgt.draggable = true
        setData(next)
      }
      }
      renderItem={(renderParams: TreeRenderItemParams) => (

        <div className="flex items-center justify-between gap-2 w-full">
          <span className="truncate">{renderParams.item.name}</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation() // don't toggle/expand/select on delete
              var next = cloneTree(data)
              removeNodeAndCollect(next, renderParams.item.id)
              setData(next)
            }}
          >
            {localised_delete}
          </Button>
        </div>
      )
      }
    />
  )
}

