import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'box-border border-[#E1DCDC] border-[0.5px] bg-background text-foreground shadow-xsmall w-full flex flex-col gap-1 group transition-all duration-100 rounded-xl',
        props.onClick && 'hover:shadow-md hover:border-border hover:border hover:cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
