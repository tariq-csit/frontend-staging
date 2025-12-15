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

function Dashboard3() {
  const {
    dashboardData,
    isLoading,
    error,
    loading,
    isClient,
    isClientData,
  } = useDashboardData();

  if (loading) return null;
  if (error) return <p className="text-foreground dark:text-gray-300">Error fetching dashboard data</p>;

  // Client Dashboard - Compact Grid Layout
  if (isClient) {
    return (
      <div className="flex flex-col gap-2 flex-component self-stretch w-full text-foreground dark:text-gray-200 pb-4">
        {/* Top Row: Enhanced Metrics Cards - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 py-0 w-full gap-2 self-stretch">
          <EnhancedClientMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
        </div>

        {/* Compact Grid Layout - All Sections Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {/* Risk Score */}
          <div className="lg:col-span-1">
            <RiskScoreCard riskScore={isClientData(dashboardData) ? (dashboardData.overview?.riskScore || 0) : 0} isLoading={isLoading} />
          </div>

          {/* Vulnerability Analytics */}
          <div className="lg:col-span-1 xl:col-span-2">
            <VulnerabilityAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </div>

          {/* Trends Section */}
          <div className="lg:col-span-1">
            <TrendsSection data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </div>

          {/* Resolution Metrics */}
          <div className="lg:col-span-1">
            <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <div className="h-[500px]">
              <ActivityFeedSection />
            </div>
          </div>

          {/* Service Type Analytics - Full Width */}
          <div className="lg:col-span-2 xl:col-span-3">
            <ServiceTypeAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </div>

          {/* Insights Panel */}
          <div className="lg:col-span-1 xl:col-span-2">
            <InsightsPanel data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </div>

          {/* Penetration Tests List - Full Width */}
          {isClientData(dashboardData) && dashboardData.pentests && dashboardData.pentests.length > 0 && (
            <div className="lg:col-span-2 xl:col-span-3">
              <ClientPentestsView pentests={dashboardData.pentests} />
            </div>
          )}
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

export default Dashboard3;

