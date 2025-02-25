import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-all duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md hover:bg-gradient-to-br hover:shadow-indigo-500/40 focus-visible:ring-indigo-600 dark:from-indigo-800 dark:to-blue-700 dark:hover:bg-gradient-to-tr dark:text-slate-100',
        destructive:
          'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md hover:bg-gradient-to-br hover:shadow-rose-500/40 focus-visible:ring-rose-600 dark:from-rose-800 dark:to-pink-700 dark:text-slate-100',
        outline:
          'border-2 border-slate-200 bg-transparent text-slate-800 hover:bg-slate-50/80 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/50 dark:hover:text-slate-50 hover:scale-[1.03] focus-visible:ring-slate-400',
        secondary:
          'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md hover:bg-gradient-to-tr hover:shadow-emerald-500/40 focus-visible:ring-emerald-600 dark:from-emerald-700 dark:to-cyan-600 dark:text-slate-100',
        ghost:
          'hover:bg-slate-100/80 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-50 [&>svg]:hover:scale-110 [&>svg]:transition-transform',
        link: 'text-slate-900 underline-offset-4 hover:underline hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400',
        special: 'animate-gradient bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white shadow-lg hover:shadow-purple-500/40 dark:from-purple-800 dark:via-pink-700 dark:to-rose-700 dark:text-slate-100'
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 px-4 text-xs rounded-lg',
        lg: 'h-12 px-8 text-lg rounded-xl',
        icon: 'size-10 [&>svg]:size-5',
      },
      theme: {
        dark: 'dark-mode',
        light: 'light-mode',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      theme: 'light',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, theme, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, theme, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
