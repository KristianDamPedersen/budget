import { BudgetSimple } from "@/types/budget/budget"
import { NavBar } from "@/components/nav-bar"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { i18n_t, I18nNode } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { router, usePage } from '@inertiajs/react'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from "react"

export type BudgetOverviewPageProps = {
  budgets: BudgetSimple[]
  title: string
  i18n: I18nNode
  pageNo: number
  perPage: number
  totalPages: number
}
export default function BudgetOverviewPage() {
  const { pageNo, perPage, totalPages, budgets, title, i18n } = (usePage().props as unknown) as BudgetOverviewPageProps
  const [activePagenumber, setActivePageNumber] = useState<number>(pageNo)
  const [firstElemValue, setFirstElemValue] = useState<number>(pageNo)
  const [secondElemValue, setSecondElemValue] = useState<number>(pageNo)
  const [thirdElemValue, setThirdElemValue] = useState<number>(pageNo)
  function goToPage(page: number): void {
    router.get(
      "/budget",                    // <-- your route for index
      { page, per_page: perPage },  // query params Rails reads
      {
        preserveScroll: true,
        preserveState: true,        // keeps local UI state if you add any
        replace: true,              // avoids stacking history if you want
        only: ["budgets", "pageNo"],// optional: partial reload (faster)
      }
    )
  }
  useEffect(() => {
    setActivePageNumber(pageNo)
    console.log(totalPages)
  }
    , [])
  useEffect(() => {
    if (activePagenumber == totalPages) {
      setFirstElemValue(activePagenumber - 2)
      setSecondElemValue(activePagenumber - 1)
      setThirdElemValue(activePagenumber)
    } else if (activePagenumber <= 1) {
      setFirstElemValue(activePagenumber)
      setSecondElemValue(activePagenumber + 1)
      setThirdElemValue(activePagenumber + 2)
    } else {
      setFirstElemValue(activePagenumber - 1)
      setSecondElemValue(activePagenumber)
      setThirdElemValue(activePagenumber + 1)
    }
    goToPage(activePagenumber)
  }
    , [activePagenumber])
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => {
              if (activePagenumber > 1) {
                setActivePageNumber(prev => prev - 1)
              }
            }} />

          </PaginationItem>
          {firstElemValue > 0 &&
            <PaginationItem>
              <PaginationLink
                isActive={activePagenumber == firstElemValue}
                onClick={() => {
                  if (firstElemValue != activePagenumber)
                    setActivePageNumber(firstElemValue)
                }}>
                {firstElemValue}</PaginationLink>
            </PaginationItem>
          }
          {secondElemValue <= totalPages &&
            <PaginationItem>
              <PaginationLink
                isActive={activePagenumber == secondElemValue}
                onClick={() => {
                  if (secondElemValue != activePagenumber)
                    setActivePageNumber(secondElemValue)
                }}>
                {secondElemValue}
              </PaginationLink>
            </PaginationItem>
          }
          {thirdElemValue <= totalPages &&
            <PaginationItem>
              <PaginationLink
                isActive={activePagenumber == thirdElemValue}
                onClick={() => {
                  if (thirdElemValue != activePagenumber)
                    setActivePageNumber(thirdElemValue)
                }}>
                {thirdElemValue}
              </PaginationLink>
            </PaginationItem>
          }
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => {
              if (activePagenumber < totalPages) {
                setActivePageNumber(prev => prev + 1)
              }
            }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>

  )

}
