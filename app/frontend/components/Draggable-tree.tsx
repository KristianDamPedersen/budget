import React from "react"
import { TreeDataItem, TreeView } from "./tree-view"
import { Button } from "./ui/button"
import { i18n_t, I18nNode } from "@/lib/utils"

export interface DraggableTreeItem {
  name: string
  id: string
}

export interface DraggableTreeHandle {
  addRoot: (name: string, id?: string) => void
  addChild: (parentId: string, name: string, id?: string) => void
  remove: (id: string) => void
  getTree: () => TreeDataItem[]
}

export interface DraggableTreeProps {
  data: DraggableTreeItem[]
  i18n: I18nNode,
  onTreeChange?: (tree: TreeDataItem[]) => void
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

function addRoot(tree: TreeDataItem[], item: TreeDataItem): TreeDataItem[] {
  return [...cloneTree(tree), item]
}


const DraggableTree = React.forwardRef<DraggableTreeHandle, DraggableTreeProps>(
  ({ data, onTreeChange, i18n }, ref) => {
    const [tree, setTree] = React.useState<TreeDataItem[]>([])
    const withActions = (items: TreeDataItem[]): TreeDataItem[] =>
      items.map((item) => ({
        ...item,
        actions: (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()

              setTree((prev) => {
                const next = cloneTree(prev)
                removeNodeAndCollect(next, item.id)
                return next
              })
            }}
          >
            {i18n_t(i18n, "common.delete")}
          </Button>
        ),
        children: item.children ? withActions(item.children) : undefined,
      }))
    React.useEffect(() => {
      setTree(
        data.map((d) => ({
          id: d.id,
          name: d.name,
          draggable: true,
          droppable: true,
        }))
      )
    }, [data])

    // keep parent informed if you want
    React.useEffect(() => {
      onTreeChange?.(tree)
    }, [tree, onTreeChange])

    React.useImperativeHandle(
      ref,
      () => ({
        addRoot: (name, id) => {
          const newId = id ?? crypto.randomUUID()
          setTree((prev) =>
            addRoot(prev, { id: newId, name, draggable: true, droppable: true })
          )
        },
        addChild: (parentId, name, id) => {
          const newId = id ?? crypto.randomUUID()
          setTree((prev) =>
            addChild(prev, parentId, { id: newId, name, draggable: true, droppable: true })
          )
        },
        remove: (id) => {
          setTree((prev) => {
            const next = cloneTree(prev)
            removeNodeAndCollect(next, id)
            return next
          })
        },
        getTree: () => tree,
      }),
      [tree]
    )

    return (
      <TreeView
        data={withActions(tree)}
        onDocumentDrag={(source, target) => {
          if (!target.id) return
          setTree((prev) => {
            // simple “move as child”:
            console.log("moving stuff")
            const next = cloneTree(prev)
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
            return next
          })
        }}
      />
    )
  }
)

DraggableTree.displayName = "DraggableTree"
export default DraggableTree

