import { BudgetSimple } from "@/types/budget/budget"
import { NavBar } from "@/components/nav-bar"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { i18n_t, I18nNode } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { router, usePage } from '@inertiajs/react'

import { useState, useEffect } from "react"
import { Pagination } from "@/components/ui/pagination"
import { PaginationWithState } from "@/components/ui/PaginationWithState"
import { DivideCircle } from "lucide-react"

export type BudgetOverviewPageProps = {
  budgets: BudgetSimple[]
  title: string
  i18n: I18nNode
  locale: string
  pageNo: number
  perPage: number
  totalPages: number
}
export default function BudgetOverviewPage() {
  const { pageNo, i18n, locale, perPage, totalPages, budgets, title } = (usePage().props as unknown) as BudgetOverviewPageProps
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
  function goToCreate() {
    router.get("/budget/create")
  }


  function goToBudgetPage(id: string) {
    router.get(`/budget/${id}`)
  }
  return (
    <div>
      <NavBar />
      <div className="grid grid-cols-4 mt-4 mb-8 items-center px-2">
        <h1 className="text-4xl col-start-1">{title}</h1>
        <Button size="sm" className="col-start-4 align-center" onClick={goToCreate}>{i18n_t(i18n, "common.create")}</Button>
      </div>
      {budgets.map(budget => {
        return (
          <Item variant="outline" className="mb-2">
            <ItemContent>
              <ItemTitle>{budget.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                onClick={() => goToBudgetPage(budget.id)}
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
