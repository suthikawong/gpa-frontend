import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'

export interface BreadcrumbItemType {
  label: string
  href: string
  isCurrentPage?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItemType[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          if (isLast) {
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )
          } else {
            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5"
              >
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </div>
            )
          }
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
