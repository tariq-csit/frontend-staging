import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { ClientMetrics } from "./types";
import { useNavigate } from "react-router-dom";

interface InsightsPanelProps {
  data?: ClientMetrics;
  isLoading?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4 dark:bg-gray-700" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full dark:bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.insights || data.insights.length === 0) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No insights at this time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
          icon: AlertTriangle,
          iconColor: "text-red-600 dark:text-red-400",
        };
      case "medium":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-300",
          badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
          icon: Clock,
          iconColor: "text-yellow-600 dark:text-yellow-400",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-700 dark:text-blue-300",
          badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
          icon: Info,
          iconColor: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "critical":
        return AlertTriangle;
      case "deadline":
        return Clock;
      default:
        return Info;
    }
  };

  const handleAction = (action: string, type: string) => {
    // Navigate based on action type
    if (action.toLowerCase().includes("review") || action.toLowerCase().includes("critical")) {
      navigate("/vulnerability-reports");
    } else if (action.toLowerCase().includes("deadline")) {
      navigate("/pentests");
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Insights & Recommendations
          </h2>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {data.insights.length}
          </span>
        </div>
        <div className="space-y-3">
          {data.insights.map((insight, index) => {
            const styles = getPriorityStyles(insight.priority);
            const TypeIcon = getTypeIcon(insight.type);
            const PriorityIcon = styles.icon;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${styles.border} ${styles.bg} animate-in fade-in slide-in-from-left-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${styles.badge}`}>
                    <TypeIcon className={`w-5 h-5 ${styles.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <PriorityIcon className={`w-4 h-4 ${styles.iconColor}`} />
                      <span className={`text-xs font-bold uppercase ${styles.text}`}>
                        {insight.priority} Priority
                      </span>
                      {insight.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}>
                          {insight.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {insight.message}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(insight.action, insight.type)}
                      className={`${styles.border} ${styles.text} hover:${styles.bg} dark:hover:${styles.bg}`}
                    >
                      {insight.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;

