import { useEffect, useState } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { i18n_t, I18nNode } from "@/lib/utils"


export type PaginationWithStateProps = {
  onActivePageChange: (page: number) => void
  totalPages: number
  initialPageNum: number
  perPage: number
}
export function PaginationWithState(Props: PaginationWithStateProps) {
  const { onActivePageChange, totalPages, initialPageNum, perPage } = Props
  const [activePagenumber, setActivePageNumber] = useState<number>(0)
  const [firstElemValue, setFirstElemValue] = useState<number>(0)
  const [secondElemValue, setSecondElemValue] = useState<number>(0)
  const [thirdElemValue, setThirdElemValue] = useState<number>(0)
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
    onActivePageChange(activePagenumber)
  }
    , [activePagenumber])
  useEffect(() => {
    setActivePageNumber(initialPageNum)
  }, [])
  return (
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
  )
}
