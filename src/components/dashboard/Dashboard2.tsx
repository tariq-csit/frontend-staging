import { useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  EnhancedClientMetrics,
  RiskScoreCard,
  VulnerabilityAnalytics,
  TrendsSection,
  ResolutionMetrics,
  ServiceTypeAnalytics,
  InsightsPanel,
  ClientPentestsView,
  ActivityFeedSection,
} from "./components";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Briefcase, 
  Lightbulb, 
  Shield, 
  Activity 
} from "lucide-react";

type Section = "overview" | "risk" | "trends" | "services" | "insights" | "pentests" | "activities";

function Dashboard2() {
  const {
    dashboardData,
    isLoading,
    error,
    loading,
    isClient,
    isClientData,
  } = useDashboardData();

  const [activeSection, setActiveSection] = useState<Section>("overview");

  if (loading) return null;
  if (error) return <p className="text-foreground dark:text-gray-300">Error fetching dashboard data</p>;

  // Client Dashboard - Sticky Sidebar Layout
  if (isClient) {
    const sidebarItems = [
      { id: "overview" as Section, label: "Overview", icon: LayoutDashboard },
      { id: "risk" as Section, label: "Risk & Analytics", icon: Shield },
      { id: "trends" as Section, label: "Trends & Metrics", icon: TrendingUp },
      { id: "services" as Section, label: "Services", icon: Briefcase },
      { id: "insights" as Section, label: "Insights", icon: Lightbulb },
      { id: "pentests" as Section, label: "Pentests", icon: BarChart3 },
      { id: "activities" as Section, label: "Activities", icon: Activity },
    ];

    const renderContent = () => {
      switch (activeSection) {
        case "overview":
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <RiskScoreCard riskScore={isClientData(dashboardData) ? (dashboardData.overview?.riskScore || 0) : 0} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                  <VulnerabilityAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
                </div>
              </div>
            </div>
          );
        case "risk":
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <RiskScoreCard riskScore={isClientData(dashboardData) ? (dashboardData.overview?.riskScore || 0) : 0} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                  <VulnerabilityAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
                </div>
              </div>
            </div>
          );
        case "trends":
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrendsSection data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
                <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
              </div>
            </div>
          );
        case "services":
          return (
            <ServiceTypeAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          );
        case "insights":
          return (
            <InsightsPanel data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          );
        case "pentests":
          return (
            <>
              {isClientData(dashboardData) && dashboardData.pentests && dashboardData.pentests.length > 0 ? (
                <ClientPentestsView pentests={dashboardData.pentests} />
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No pentests available
                </div>
              )}
            </>
          );
        case "activities":
          return <ActivityFeedSection />;
        default:
          return null;
      }
    };

    return (
      <div className="flex flex-col gap-4 flex-component self-stretch w-full text-foreground dark:text-gray-200 pb-6">
        {/* Top Row: Enhanced Metrics Cards - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 py-0 w-full gap-3 self-stretch">
          <EnhancedClientMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          {/* Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <nav className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm p-2">
                <ul className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveSection(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
                            activeSection === item.id
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-h-[600px]">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Sidebar - Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150",
                    activeSection === item.id
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 min-h-[400px]">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // For non-client roles
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-500 dark:text-gray-400">This dashboard variant is optimized for client users.</p>
    </div>
  );
}

export default Dashboard2;

