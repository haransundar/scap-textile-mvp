import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100)
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          className
        )}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className={cn(
            "h-full bg-blue-600 transition-all duration-300 ease-in-out",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }
