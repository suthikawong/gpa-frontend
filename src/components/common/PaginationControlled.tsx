// https://github.com/bryaneaton13/shadcn-next-link-pagination/blob/main/components/ui/pagination-with-links.tsx

import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination'

export interface PaginationControlledProps {
  totalCount: number
  pageSize: number
  page: number
  onPageChange: (newPage: number) => void
}

export function PaginationControlled({ pageSize, totalCount, page, onPageChange }: PaginationControlledProps) {
  const totalPageCount = Math.ceil(totalCount / pageSize)
  console.log('TLOG ~ totalPageCount:', totalPageCount === 0)
  console.log(page === totalPageCount)
  console.log('final : ', page === totalPageCount || totalPageCount === 0)

  const renderPageNumbers = () => {
    const items: React.ReactNode[] = []
    const maxVisiblePages = 5

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={page === i ? true : false}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={page === 1 ? true : false}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPageCount - 1, page + 1)

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={page === i ? true : false}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      if (page < totalPageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      items.push(
        <PaginationItem key={totalPageCount}>
          <PaginationLink
            onClick={() => onPageChange(totalPageCount)}
            isActive={page === totalPageCount ? true : false}
          >
            {totalPageCount}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 w-full">
      <Pagination className="md:justify-end">
        <PaginationContent className="max-sm:gap-0">
          <PaginationItem>
            <PaginationPrevious
              tabIndex={page === 1 ? -1 : undefined}
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
            ></PaginationPrevious>
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              tabIndex={page === totalPageCount ? -1 : undefined}
              onClick={() => onPageChange(Math.min(page + 1, totalPageCount))}
              className={page === totalPageCount || totalPageCount === 0 ? 'pointer-events-none opacity-50' : undefined}
            ></PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
