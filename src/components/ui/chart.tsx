import * as React from "react"
import { TooltipProps } from "recharts"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsePieChart,
  Pie as RechartsPie,
} from "recharts"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

interface ChartTooltipContentProps extends TooltipProps<any, any> {
  config: ChartConfig
  className?: string
  formatter?: (value: number) => string | number
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  config,
  className,
  formatter,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
    >
      <div className="grid gap-2">
        {payload.map((item: any, i: number) => {
          const value = formatter
            ? formatter(item.value)
            : item.value.toLocaleString()
          const name = config[item.name]?.label ?? item.name
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              {!hideLabel && <span className="text-muted-foreground">{name}:</span>}
              <span>{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { RechartsePieChart as PieChart, RechartsPie as Pie, Tooltip as ChartTooltip } 