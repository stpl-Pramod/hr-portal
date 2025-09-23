import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 ease-in-out overflow-hidden shadow-sm hover:shadow-md transform hover:scale-105',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 [a&]:hover:from-blue-600 [a&]:hover:to-blue-700 [a&]:hover:shadow-blue-500/40',
        secondary:
          'border-transparent bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-500/25 [a&]:hover:from-slate-700 [a&]:hover:to-slate-800 [a&]:hover:shadow-slate-500/40',
        destructive:
          'border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25 [a&]:hover:from-red-600 [a&]:hover:to-red-700 [a&]:hover:shadow-red-500/40 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40',
        success:
          'border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/25 [a&]:hover:from-green-600 [a&]:hover:to-green-700 [a&]:hover:shadow-green-500/40',
        warning:
          'border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-500/25 [a&]:hover:from-yellow-600 [a&]:hover:to-yellow-700 [a&]:hover:shadow-yellow-500/40',
        info:
          'border-transparent bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-cyan-500/25 [a&]:hover:from-cyan-600 [a&]:hover:to-cyan-700 [a&]:hover:shadow-cyan-500/40',
        purple:
          'border-transparent bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/25 [a&]:hover:from-purple-600 [a&]:hover:to-purple-700 [a&]:hover:shadow-purple-500/40',
        orange:
          'border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/25 [a&]:hover:from-orange-600 [a&]:hover:to-orange-700 [a&]:hover:shadow-orange-500/40',
        outline:
          'text-foreground border-slate-300 dark:border-slate-600 bg-transparent [a&]:hover:bg-slate-100 [a&]:hover:text-slate-900 dark:[a&]:hover:bg-slate-800 dark:[a&]:hover:text-slate-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
