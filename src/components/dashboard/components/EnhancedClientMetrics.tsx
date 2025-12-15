import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, Clock, CheckCircle2, TrendingUp, FileText, Calendar } from "lucide-react";
import { ClientMetrics } from "./types";

interface EnhancedClientMetricsProps {
  data?: ClientMetrics;
  isLoading?: boolean;
}

const EnhancedClientMetrics: React.FC<EnhancedClientMetricsProps> = ({ data, isLoading }) => {
  const ongoingAnimated = useSpring({
    from: { number: 0 },
    number: data?.ongoingPentests || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const scheduledAnimated = useSpring({
    from: { number: 0 },
    number: data?.scheduledPentests || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const vulnerabilitiesAnimated = useSpring({
    from: { number: 0 },
    number: data?.vulnerabilityCount || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const riskScoreAnimated = useSpring({
    from: { number: 0 },
    number: data?.overview?.riskScore || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const completionRateAnimated = useSpring({
    from: { number: 0 },
    number: data?.overview?.completionRate || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const criticalAnimated = useSpring({
    from: { number: 0 },
    number: data?.overview?.vulnerabilities?.bySeverity?.critical || 0,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex p-4 items-center gap-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900">
            <Skeleton className="w-12 h-12 rounded-full dark:bg-gray-700" />
            <div className="flex-1">
              <Skeleton className="h-4 w-16 mb-2 dark:bg-gray-700" />
              <Skeleton className="h-6 w-24 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      label: "Ongoing Pentests",
      value: data.ongoingPentests,
      animated: ongoingAnimated,
      icon: Clock,
      iconBg: "bg-orange-100 dark:bg-orange-950/40",
      iconColor: "text-orange-600 dark:text-orange-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
    },
    {
      label: "Scheduled Pentests",
      value: data.scheduledPentests,
      animated: scheduledAnimated,
      icon: Calendar,
      iconBg: "bg-blue-100 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
    },
    {
      label: "Total Vulnerabilities",
      value: data.vulnerabilityCount,
      animated: vulnerabilitiesAnimated,
      icon: FileText,
      iconBg: "bg-purple-100 dark:bg-purple-950/40",
      iconColor: "text-purple-600 dark:text-purple-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
    },
    {
      label: "Risk Score",
      value: data.overview?.riskScore || 0,
      animated: riskScoreAnimated,
      icon: Shield,
      iconBg: (data.overview?.riskScore || 0) >= 75 ? "bg-red-100 dark:bg-red-950/40" : (data.overview?.riskScore || 0) >= 50 ? "bg-orange-100 dark:bg-orange-950/40" : "bg-green-100 dark:bg-green-950/40",
      iconColor: (data.overview?.riskScore || 0) >= 75 ? "text-red-600 dark:text-red-400" : (data.overview?.riskScore || 0) >= 50 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
      suffix: "/100",
    },
    {
      label: "Completion Rate",
      value: data.overview?.completionRate || 0,
      animated: completionRateAnimated,
      icon: CheckCircle2,
      iconBg: "bg-green-100 dark:bg-green-950/40",
      iconColor: "text-green-600 dark:text-green-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
      suffix: "%",
    },
    {
      label: "Critical Vulnerabilities",
      value: data.overview?.vulnerabilities?.bySeverity?.critical || 0,
      animated: criticalAnimated,
      icon: AlertTriangle,
      iconBg: "bg-red-100 dark:bg-red-950/40",
      iconColor: "text-red-600 dark:text-red-400",
      text: "text-gray-900 dark:text-gray-100",
      border: "border-gray-200 dark:border-gray-800",
    },
  ];

  return (
    <>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-lg bg-white dark:bg-gray-900/50 border ${metric.border} hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200`}
          >
            <div className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${metric.iconBg} group-hover:scale-105 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                  {metric.label}
                </div>
                <div className={`text-2xl font-semibold ${metric.text}`}>
                  <animated.span>
                    {metric.animated.number.to((n) => Math.round(n) || 0)}
                  </animated.span>
                  {metric.suffix && <span className="text-lg ml-0.5">{metric.suffix}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};


export default EnhancedClientMetrics;

