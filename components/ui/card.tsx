import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-white to-blue-50/50",
      "text-slate-950 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl",
      "dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-800/60 dark:text-slate-50",
      "transform-gpu hover:-translate-y-1 hover:[transform:rotate3d(1,-1,0,2deg)]",
      "before:absolute before:inset-0 before:-z-10 before:animate-pulse before:bg-gradient-to-r before:from-indigo-500/20 before:to-cyan-300/20 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 transition-transform duration-200 hover:translate-x-1", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-3xl font-bold leading-tight tracking-tight transition-all duration-300",
      "bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent",
      "hover:bg-gradient-to-br hover:shadow-sm dark:from-indigo-400 dark:to-blue-300",
      "transition-spacing hover:tracking-wider",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-md text-slate-600 transition-all duration-300 hover:text-slate-700",
      "dark:text-slate-400 dark:hover:text-slate-300",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0 space-y-4 transition-opacity duration-300 hover:opacity-95", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0 gap-4 transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-inner",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
