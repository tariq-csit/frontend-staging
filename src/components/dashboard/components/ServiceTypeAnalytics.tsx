import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Network, Cloud, Smartphone, AlertTriangle, BarChart3, Info } from "lucide-react";
import { ClientMetrics } from "./types";
import { useSpring, animated } from "@react-spring/web";

interface ServiceTypeAnalyticsProps {
  data?: ClientMetrics;
  isLoading?: boolean;
}

const ServiceTypeAnalytics: React.FC<ServiceTypeAnalyticsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-32 dark:bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full dark:bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || !data.serviceTypeAnalytics) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Service Type Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Breakdown of vulnerabilities by service type
          </p>
        </div>
        <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
          <CardContent className="p-6">
            <Empty>
              <EmptyMedia variant="icon">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Service Data Available</EmptyTitle>
                <EmptyDescription>Service type analytics data is not available at this time.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  const services = [
    {
      key: "webapppentest",
      name: "Web App Pentest",
      icon: Globe,
      color: "blue",
      data: data.serviceTypeAnalytics?.webapppentest,
    },
    {
      key: "networkpentest",
      name: "Network Pentest",
      icon: Network,
      color: "purple",
      data: data.serviceTypeAnalytics?.networkpentest,
    },
    {
      key: "cloudpentest",
      name: "Cloud Pentest",
      icon: Cloud,
      color: "green",
      data: data.serviceTypeAnalytics?.cloudpentest,
    },
    {
      key: "mobileapppentest",
      name: "Mobile App Pentest",
      icon: Smartphone,
      color: "orange",
      data: data.serviceTypeAnalytics?.mobileapppentest,
    },
  ].filter((service) => service.data);

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        iconBg: "bg-green-100 dark:bg-green-900/40",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-600 dark:text-orange-400",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
      },
    };
    return colors[color] || colors.blue;
  };

  const ServiceCard = ({ service }: { service: typeof services[0] }) => {
    const colors = getColorClasses(service.color);
    const Icon = service.icon;
    const animatedCount = useSpring({
      from: { number: 0 },
      number: service.data?.count || 0,
      config: { mass: 1, tension: 50, friction: 30 },
    });

    const animatedCvss = useSpring({
      from: { number: 0 },
      number: service.data?.averageCvss || 0,
      config: { mass: 1, tension: 50, friction: 30 },
    });

    return (
      <Card
        className={`dark:bg-gray-900/50 dark:border-gray-800 border ${colors.border} bg-white dark:bg-gray-900/50 hover:shadow-sm transition-all duration-200`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-lg ${colors.iconBg} cursor-help`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Service type: {service.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <CardTitle className="text-lg font-bold dark:text-gray-100">{service.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white dark:bg-gray-700/50">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Vulnerabilities</div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                <animated.span>
                  {animatedCount.number.to((n) => Math.round(n || 0))}
                </animated.span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-gray-700/50">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg CVSS</div>
              <div className={`text-2xl font-bold ${colors.text}`}>
                <animated.span>
                  {animatedCvss.number.to((n) => (n || 0).toFixed(1))}
                </animated.span>
              </div>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Severity Breakdown</div>
            {[
              { label: "Critical", value: service.data?.severities.critical || 0, color: "#ef4444" },
              { label: "High", value: service.data?.severities.high || 0, color: "#f97316" },
              { label: "Medium", value: service.data?.severities.medium || 0, color: "#eab308" },
              { label: "Low", value: service.data?.severities.low || 0, color: "#22c55e" },
            ].map((severity) => (
              <div key={severity.label} className="flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severity.color }}
                  />
                  <span className="text-sm">{severity.label}</span>
                </Badge>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {severity.value}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-3" />
          
          {/* Average Severity & Critical Count */}
          <div className="pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Average Severity</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {service.data?.averageSeverity || "N/A"}
                </div>
              </div>
              {service.data?.criticalCount !== undefined && service.data.criticalCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-bold">
                    {service.data.criticalCount} Critical
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Service Type Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Breakdown of vulnerabilities by service type
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.key} service={service} />
        ))}
      </div>
    </div>
  );
};

export default ServiceTypeAnalytics;

