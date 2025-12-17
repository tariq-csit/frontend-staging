import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { ClientMetrics } from "./types";

interface TrendsSectionProps {
  data?: ClientMetrics;
  isLoading?: boolean;
  showOnly?: "velocity" | "monthly" | "all";
}

const TrendsSection: React.FC<TrendsSectionProps> = ({ data, isLoading, showOnly = "all" }) => {
  if (isLoading) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-48 dark:bg-gray-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.trends) return null;

  // Resolution velocity data
  const velocityData = [
    { period: "Last 7 Days", resolved: data.trends?.resolutionVelocity?.last7Days || 0 },
    { period: "Last 30 Days", resolved: data.trends?.resolutionVelocity?.last30Days || 0 },
  ];

  const trend = data.trends?.resolutionVelocity?.trend || "stable";
  const TrendIcon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;
  const getTrendBadgeVariant = () => {
    if (trend === "improving") return "default";
    if (trend === "declining") return "destructive";
    return "secondary";
  };
  const trendBadgeClass = trend === "improving" 
    ? "bg-green-600 dark:bg-green-500 text-white border-green-600 dark:border-green-500" 
    : trend === "declining" 
    ? "bg-red-600 dark:bg-red-500 text-white border-red-600 dark:border-red-500"
    : "bg-gray-600 dark:bg-gray-500 text-white border-gray-600 dark:border-gray-500";

  // Monthly vulnerabilities data
  const monthlyData = (data.trends?.vulnerabilitiesByMonth || []).map((month) => ({
    month: new Date(month.year, month.month - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    critical: month.bySeverity?.[0]?.critical || 0,
    high: month.bySeverity?.[0]?.high || 0,
    medium: month.bySeverity?.[0]?.medium || 0,
    low: month.bySeverity?.[0]?.low || 0,
    total: month.total || 0,
  }));

  const velocityChartConfig = {
    resolved: { label: "Resolved", color: "#3b82f6" },
  };

  const monthlyChartConfig = {
    critical: { label: "Critical", color: "#ef4444" },
    high: { label: "High", color: "#f97316" },
    medium: { label: "Medium", color: "#eab308" },
    low: { label: "Low", color: "#22c55e" },
  };

  const VelocityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltipContent
          active={active}
          payload={payload.map((item: any) => ({ ...item, name: "resolved" }))}
          config={velocityChartConfig}
          label={label}
        />
      );
    }
    return null;
  };

  const MonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltipContent
          active={active}
          payload={payload}
          config={monthlyChartConfig}
          label={label}
        />
      );
    }
    return null;
  };

  const renderResolutionVelocity = () => (
    <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200 h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Resolution Velocity
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 capitalize ${trendBadgeClass}`}
            >
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-semibold">{trend}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {data.trends.resolutionVelocity.last7Days}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Resolved (7 days)
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {data.trends.resolutionVelocity.last30Days}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Resolved (30 days)
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip 
                  content={<VelocityTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  animationDuration={200}
                />
                <Bar 
                  dataKey="resolved" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  style={{ transition: 'opacity 0.2s ease-in-out' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
  );

  const renderMonthlyVulnerabilities = () => (
    <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            Vulnerabilities by Month
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip content={<MonthlyTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  stroke="#ef4444"
                  fill="url(#colorCritical)"
                  name="Critical"
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  stroke="#f97316"
                  fill="url(#colorHigh)"
                  name="High"
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  stroke="#eab308"
                  fill="url(#colorMedium)"
                  name="Medium"
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stackId="1"
                  stroke="#22c55e"
                  fill="url(#colorLow)"
                  name="Low"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-base font-bold text-red-600 dark:text-red-400">
                {monthlyData.reduce((sum, m) => sum + m.critical, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-base font-bold text-orange-600 dark:text-orange-400">
                {monthlyData.reduce((sum, m) => sum + m.high, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">High</div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                {monthlyData.reduce((sum, m) => sum + m.medium, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Medium</div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-base font-bold text-green-600 dark:text-green-400">
                {monthlyData.reduce((sum, m) => sum + m.low, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>
  );

  if (showOnly === "velocity") {
    return renderResolutionVelocity();
  }

  if (showOnly === "monthly") {
    return renderMonthlyVulnerabilities();
  }

  return (
    <div className="space-y-3">
      {renderResolutionVelocity()}
      {renderMonthlyVulnerabilities()}
    </div>
  );
};

export default TrendsSection;

