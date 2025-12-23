import { BudgetSimple } from "@/types/budget/budget"
import { NavBar } from "@/components/nav-bar"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { i18n_t, I18nNode } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { router, usePage } from '@inertiajs/react'

import { useState, useEffect } from "react"
import { Pagination } from "@/components/ui/pagination"
import { PaginationWithState } from "@/components/ui/PaginationWithState"

export type BudgetOverviewPageProps = {
  budgets: BudgetSimple[]
  title: string
  locale: string
  i18n: I18nNode
  pageNo: number
  perPage: number
  totalPages: number
}
export default function BudgetOverviewPage() {
  const { pageNo, locale, perPage, totalPages, budgets, title, i18n } = (usePage().props as unknown) as BudgetOverviewPageProps
  const [activePagenumber, setActivePageNumber] = useState<number>(pageNo)
  function goToPage(page: number): void {
    router.get(
      "/budget",                    // <-- your route for index
      { page, per_page: perPage, locale },  // query params Rails reads
      {
        preserveScroll: true,
        preserveState: true,        // keeps local UI state if you add any
        replace: true,              // avoids stacking history if you want
        only: ["budgets", "pageNo", "totalPages"],// optional: partial reload (faster)
      }
    )
  }

  return (
    <div>
      <NavBar />
      <h1 className="text-4xl">{title}</h1>
      {budgets.map(budget => {
        return (
          <Item>
            <ItemContent>
              <ItemTitle>{budget.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="sm">{i18n_t(i18n, "common.open")}</Button>
            </ItemActions>
          </Item>
        )
      })}
      <PaginationWithState
        onActivePageChange={goToPage}
        initialPageNum={pageNo}
        perPage={perPage}
        totalPages={totalPages} />

    </div>

  )

}
