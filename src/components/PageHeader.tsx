import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowBack } from '#/icons'

interface Breadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  back?: { label?: string; to: string; state?: unknown }
  breadcrumbs?: Breadcrumb[]
  title: ReactNode
  subtitle?: string
  actions?: ReactNode
  sticky?: boolean
}

export function PageHeader({ back, breadcrumbs, title, subtitle, actions, sticky }: PageHeaderProps) {
  const hasNav = back || (breadcrumbs && breadcrumbs.length > 0)
  return (
    <div className={sticky ? 'mb-5 sticky top-0 z-30 bg-shell pt-4 pb-2 -mt-4' : 'mb-5'}>
      {hasNav && (
        <nav className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          {back && (
            <span className="flex items-center gap-1.5">
              <Link
                to={back.to as '/'}
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <ArrowBack className="h-3.5 w-3.5" />
                {back.label ?? 'Back'}
              </Link>
              {breadcrumbs && breadcrumbs.length > 0 && <span className="text-border">·</span>}
            </span>
          )}
          {breadcrumbs?.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {crumb.to ? (
                <Link to={crumb.to as '/'} className="hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
