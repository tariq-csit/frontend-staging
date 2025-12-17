import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, TrendingUp, Shield, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskScoreCardProps {
  riskScore: number;
  isLoading?: boolean;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskScore, isLoading }) => {
  const animatedScore = useSpring({
    from: { number: 0 },
    number: riskScore,
    config: { mass: 1, tension: 50, friction: 30 },
    immediate: isLoading,
  });

  const getRiskLevel = (score: number) => {
    // Risk score is on a scale of 0-10
    if (score >= 7.5) return { level: "Critical", color: "text-red-600 dark:text-red-400", bgGradient: "from-red-500 to-red-700", bgLight: "bg-red-50 dark:bg-red-950/30", borderColor: "border-red-200 dark:border-red-900/50", badgeBg: "bg-red-100 dark:bg-red-950/40", badgeText: "text-red-700 dark:text-red-400" };
    if (score >= 5) return { level: "High", color: "text-orange-600 dark:text-orange-400", bgGradient: "from-orange-500 to-orange-700", bgLight: "bg-orange-50 dark:bg-orange-950/30", borderColor: "border-orange-200 dark:border-orange-900/50", badgeBg: "bg-orange-100 dark:bg-orange-950/40", badgeText: "text-orange-700 dark:text-orange-400" };
    if (score >= 2.5) return { level: "Medium", color: "text-yellow-600 dark:text-yellow-400", bgGradient: "from-yellow-500 to-yellow-700", bgLight: "bg-yellow-50 dark:bg-yellow-950/30", borderColor: "border-yellow-200 dark:border-yellow-900/50", badgeBg: "bg-yellow-100 dark:bg-yellow-950/40", badgeText: "text-yellow-700 dark:text-yellow-400" };
    return { level: "Low", color: "text-green-600 dark:text-green-400", bgGradient: "from-green-500 to-green-700", bgLight: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-200 dark:border-green-900/50", badgeBg: "bg-green-100 dark:bg-green-950/40", badgeText: "text-green-700 dark:text-green-400" };
  };

  const riskLevel = getRiskLevel(riskScore);
  const circumference = 2 * Math.PI * 70;
  // Convert score from 0-10 scale to percentage (0-100) for the circular progress
  const offset = circumference - (riskScore / 10) * circumference;

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32 dark:bg-gray-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`dark:bg-gray-900/50 dark:border-gray-800 overflow-hidden border ${riskLevel.borderColor} bg-white dark:bg-gray-900/50`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-base font-semibold dark:text-gray-100 flex items-center gap-2 cursor-help">
                  <Shield className={`w-4 h-4 ${riskLevel.color}`} />
                  Risk Score
                  <Info className="w-3 h-3 text-gray-400" />
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk score calculated from vulnerability severity and status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${riskLevel.badgeBg} ${riskLevel.badgeText} border ${riskLevel.borderColor}`}
                >
                  {riskLevel.level}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk level based on vulnerability severity and count</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Circular Progress Gauge */}
          <div className="relative w-40 h-40">
            <svg className="transform -rotate-90 w-40 h-40" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Animated progress circle */}
              <animated.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={animatedScore.number.to((v) => circumference - (v / 10) * circumference)}
                strokeLinecap="round"
                className={`text-transparent bg-gradient-to-r ${riskLevel.bgGradient} bg-clip-text`}
                style={{
                  stroke: riskScore >= 7.5 ? "#ef4444" : riskScore >= 5 ? "#f97316" : riskScore >= 2.5 ? "#eab308" : "#22c55e",
                }}
              />
            </svg>
            {/* Center score */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${riskLevel.color}`}>
                  <animated.span>
                    {animatedScore.number.to((n) => (n || 0).toFixed(1))}
                  </animated.span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 10</div>
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Risk Indicators */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
              <span className={`font-semibold ${riskLevel.color}`}>{riskLevel.level}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <animated.div
                className={`h-full bg-gradient-to-r ${riskLevel.bgGradient} rounded-full`}
                style={{
                  width: animatedScore.number.to((v) => `${(v / 10) * 100}%`),
                }}
              />
            </div>
          </div>

          {/* Warning indicator for high risk */}
          {riskScore >= 5 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${riskLevel.bgLight} border ${riskLevel.borderColor}`}>
              <AlertTriangle className={`w-4 h-4 ${riskLevel.color}`} />
              <span className={`text-xs font-medium ${riskLevel.color}`}>
                {riskScore >= 7.5 ? "Immediate action required" : "Review recommended"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;

