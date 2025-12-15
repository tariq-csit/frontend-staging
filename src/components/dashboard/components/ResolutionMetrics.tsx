import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import { useSpring, animated } from "@react-spring/web";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { ClientMetrics } from "./types";

interface ResolutionMetricsProps {
  data?: ClientMetrics;
  isLoading?: boolean;
}

const ResolutionMetrics: React.FC<ResolutionMetricsProps> = ({ data, isLoading }) => {
  const resolutionRate = useSpring({
    from: { number: 0 },
    number: data?.resolutionMetrics?.resolutionRate || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardHeader>
          <Skeleton className="h-6 w-48 dark:bg-gray-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-52 w-full dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.resolutionMetrics) return null;

  // Average resolution time by severity
  const resolutionTimeData = [
    {
      name: "Critical",
      days: data.resolutionMetrics?.averageResolutionTime?.critical || 0,
      color: "#ef4444",
    },
    {
      name: "High",
      days: data.resolutionMetrics?.averageResolutionTime?.high || 0,
      color: "#f97316",
    },
    {
      name: "Medium",
      days: data.resolutionMetrics?.averageResolutionTime?.medium || 0,
      color: "#eab308",
    },
    {
      name: "Low",
      days: data.resolutionMetrics?.averageResolutionTime?.low || 0,
      color: "#22c55e",
    },
  ];

  // Average time in status
  const timeInStatusData = [
    {
      name: "New",
      days: data.resolutionMetrics?.averageTimeInStatus?.new || 0,
      color: "#6b7280",
    },
    {
      name: "Triaged",
      days: data.resolutionMetrics?.averageTimeInStatus?.triaged || 0,
      color: "#3b82f6",
    },
    {
      name: "Ready For Retest",
      days: data.resolutionMetrics?.averageTimeInStatus?.readyForRetest || 0,
      color: "#f59e0b",
    },
    {
      name: "Resolved",
      days: data.resolutionMetrics?.averageTimeInStatus?.resolved || 0,
      color: "#22c55e",
    },
    {
      name: "Not Applicable",
      days: data.resolutionMetrics?.averageTimeInStatus?.notApplicable || 0,
      color: "#ef4444",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average: <span className="font-medium">{payload[0].value.toFixed(1)} days</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Resolution Rate Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            Resolution Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                <animated.span>
                  {resolutionRate.number.to((n) => `${(n || 0).toFixed(1)}%`)}
                </animated.span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                of vulnerabilities resolved
              </p>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <animated.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={251.2}
                  strokeDashoffset={resolutionRate.number.to((v) => 251.2 - (v / 100) * 251.2)}
                  strokeLinecap="round"
                  className="text-green-600 dark:text-green-400"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Resolution Time by Severity */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold dark:text-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Average Resolution Time by Severity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTimeData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{ value: "Days", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="days" radius={[8, 8, 0, 0]}>
                  {resolutionTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {resolutionTimeData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {item.days.toFixed(1)} days
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Average Time in Status */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Average Time in Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeInStatusData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  label={{ value: "Days", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="days" radius={[8, 8, 0, 0]}>
                  {timeInStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {timeInStatusData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {item.days.toFixed(1)} days
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResolutionMetrics;

