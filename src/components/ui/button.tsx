import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '#/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-white border border-primary hover:bg-primary/90',
        variant === 'secondary' && 'bg-white text-primary border border-primary hover:bg-primary/5',
        variant === 'ghost' && 'bg-transparent text-secondary-foreground hover:bg-muted border border-transparent',
        variant === 'destructive' && 'bg-destructive text-white border border-destructive hover:bg-destructive/90',
        size === 'sm' && 'h-8 px-3 text-xs gap-1.5',
        size === 'md' && 'h-10 px-4 text-sm gap-2',
        size === 'lg' && 'h-12 px-4 text-base gap-2',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button }
