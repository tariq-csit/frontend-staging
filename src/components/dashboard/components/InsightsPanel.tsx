import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, Info, MessageSquare } from "lucide-react";
import { ClientMetrics } from "./types";
import { useNavigate } from "react-router-dom";
import InsightsVulnerabilitiesDialog from "./InsightsVulnerabilitiesDialog";
import InsightsPentestsDialog from "./InsightsPentestsDialog";

interface InsightsPanelProps {
  data?: ClientMetrics;
  isLoading?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [selectedInsight, setSelectedInsight] = useState<{
    type: string;
    title: string;
    vulnerabilities?: any[];
    pentests?: any[];
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <Empty>
            <EmptyMedia variant="icon">
              <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Insights Available</EmptyTitle>
              <EmptyDescription>No insights or recommendations at this time.</EmptyDescription>
            </EmptyHeader>
          </Empty>
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
      case "unresponded_comments":
        return MessageSquare;
      default:
        return Info;
    }
  };

  const handleAction = (insight: any) => {
    const { action, type, vulnerabilities, pentests } = insight;

    // If there are vulnerabilities, show them in a dialog
    if (vulnerabilities && vulnerabilities.length > 0) {
      setSelectedInsight({
        type,
        title: insight.message,
        vulnerabilities,
      });
      setDialogOpen(true);
      return;
    }

    // If there are pentests (for deadline insights), show them in a dialog
    if (pentests && pentests.length > 0) {
      setSelectedInsight({
        type,
        title: insight.message,
        pentests,
      });
      setDialogOpen(true);
      return;
    }

    // Default navigation based on action type
    if (action.toLowerCase().includes("review") || action.toLowerCase().includes("critical")) {
      navigate("/vulnerability-reports");
    } else if (action.toLowerCase().includes("deadline")) {
      navigate("/pentests");
    } else if (action.toLowerCase().includes("comment")) {
      navigate("/vulnerability-reports");
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
          <Badge variant="secondary" className="text-sm font-semibold">
            {data.insights.length}
          </Badge>
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
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold uppercase ${styles.badge} border ${styles.border}`}
                      >
                        {insight.priority} Priority
                      </Badge>
                      {insight.count > 0 && (
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${styles.badge} border ${styles.border}`}
                        >
                          {insight.count}
                        </Badge>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 cursor-help">
                            {insight.message}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{insight.message}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Separator className="my-2" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(insight)}
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

      {selectedInsight && selectedInsight.vulnerabilities && (
        <InsightsVulnerabilitiesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedInsight.title}
          vulnerabilities={selectedInsight.vulnerabilities}
          insightType={selectedInsight.type}
        />
      )}
      {selectedInsight && selectedInsight.pentests && (
        <InsightsPentestsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={selectedInsight.title}
          pentests={selectedInsight.pentests}
        />
      )}
    </Card>
  );
};

export default InsightsPanel;

