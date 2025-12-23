import { BudgetItem } from '../../types/budget/BudgetItem.tsx'
import { i18n_t, I18nNode } from '@/lib/utils'
import { ReactElement, useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { BudgetCategory } from '@/types/budget/BudgetCategory.tsx'

type BudgetItemRow = BudgetItem & {
  first_occurence_formatted: string
  category_string: string
}
export type BudgetItemTableProps = {
  i18n: I18nNode
  data: BudgetItem[]
  categories: BudgetCategory[]
  setData: (items: BudgetItem[]) => void
}

export function BudgetItemTable(Props: BudgetItemTableProps): ReactElement {

  const { i18n, data, categories, setData } = Props
  const [formatted, setFormatted] = useState<BudgetItemRow[]>([])

  useEffect(() => {

    let rows: BudgetItemRow[] = data.map(x => ({
      ...x,
      category_string: categories.find((bc: BudgetCategory) => bc.id == x.category_id)?.name ?? x.category_id.toString(),
      first_occurence_formatted: new Date(x.first_occurence).toLocaleDateString("da"),
    }));
    console.log("setting table")
    setFormatted(rows)
  }, [data])
  const columns: ColumnDef<BudgetItemRow>[] = [
    {
      accessorKey: "name",
      header: i18n_t(i18n, "common.name")
    },
    {
      accessorKey: "category_string",
      header: i18n_t(i18n, "entities.category.label")
    },
    {
      accessorKey: "item_type",
      header: i18n_t(i18n, "entities.budget_item.type")
    },
    {
      accessorKey: "cadence",
      header: i18n_t(i18n, "entities.budget_item.cadence")
    },
    {
      accessorKey: "first_occurence_formatted",
      header: i18n_t(i18n, "entities.budget_item.first_occurence")
    },
    {
      accessorKey: "currency",
      header: i18n_t(i18n, "common.currency")
    },
    {
      accessorKey: "value",
      header: i18n_t(i18n, "common.value")
    }
  ]
  const table = useReactTable({
    data: formatted,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
