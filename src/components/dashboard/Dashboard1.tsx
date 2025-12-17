import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ReportsTab,
} from "./components";

function Dashboard1() {
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

  // Client Dashboard - Tab-Based Layout
  if (isClient) {
    return (
      <div className="flex flex-col gap-4 flex-component self-stretch w-full text-foreground dark:text-gray-200 pb-6">
        {/* Top Row: Enhanced Metrics Cards - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 py-0 w-full gap-3 self-stretch">
          <EnhancedClientMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
        </div>

        {/* Tab-Based Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
            <TabsTrigger value="pentests" className="text-xs sm:text-sm">Pentests</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs sm:text-sm">Activities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 flex flex-col gap-4">
                <RiskScoreCard riskScore={isClientData(dashboardData) ? (dashboardData.overview?.riskScore || 0) : 0} isLoading={isLoading} />
                <div className="h-[335px]">
                  <ActivityFeedSection />
                </div>
              </div>
              <div className="lg:col-span-2">
                <VulnerabilityAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ gridAutoRows: '1fr' }}>
              {/* Top Row: Resolution Velocity + Resolution Rate */}
              <div className="lg:col-span-1 flex">
                <div className="w-full">
                  <TrendsSection data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} showOnly="velocity" />
                </div>
              </div>
              <div className="lg:col-span-1 flex">
                <div className="w-full">
                  <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} showOnly="rate" />
                </div>
              </div>
              {/* Middle Row: Vulnerabilities by Month - Full Width */}
              <div className="lg:col-span-2">
                <TrendsSection data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} showOnly="monthly" />
              </div>
              {/* Bottom Row: Average Resolution Time + Average Time in Status */}
              <div className="lg:col-span-1 flex">
                <div className="w-full">
                  <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} showOnly="resolutionTime" />
                </div>
              </div>
              <div className="lg:col-span-1 flex">
                <div className="w-full">
                  <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} showOnly="timeInStatus" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-4">
            <ServiceTypeAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-4">
            <InsightsPanel data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
          </TabsContent>

          {/* Pentests Tab */}
          <TabsContent value="pentests" className="mt-4">
            {isClientData(dashboardData) && dashboardData.pentests && dashboardData.pentests.length > 0 ? (
              <ClientPentestsView pentests={dashboardData.pentests} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No pentests available
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-4">
            <ActivityFeedSection />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // For non-client roles, show a message or redirect
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-500 dark:text-gray-400">This dashboard variant is optimized for client users.</p>
    </div>
  );
}

export default Dashboard1;

