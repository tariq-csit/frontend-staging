import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useUser } from "@/hooks/useUser";
import { PentesterMetrics, AdminMetrics, ClientMetrics } from "./components/types";
import {
  MetricsCards,
  OngoingPentests,
  VulnerabilityReportChart,
  ActivityFeedSection,
  PentesterImpactSection,
  PentestsListSection,
  ClientPentestsView,
  RiskScoreCard,
  VulnerabilityAnalytics,
  ResolutionMetrics,
  TrendsSection,
  ServiceTypeAnalytics,
  InsightsPanel,
  EnhancedClientMetrics,
  VulnerabilityTrendChart,
} from "./components";
import CollapsibleSection from "./components/CollapsibleSection";

function DashboardHome() {
  const { user, loading } = useUser();
  const isPentester = user?.role === 'pentester';
  const isClient = user?.role === 'client';

  // Admin dashboard data fetching
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useQuery<AdminMetrics | PentesterMetrics | ClientMetrics>({
    queryKey: ["DashboardData"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(isPentester ? apiRoutes.pentester.dashboard : isClient ? apiRoutes.client.dashboard : apiRoutes.dashboard);
        return response.data;
      } catch (err: any) {
        throw err;
      }
    },
    enabled: !loading 
  });

  console.log(dashboardData);

  // Role-specific loading states
  const isLoading = dashboardLoading;
  const error = dashboardError;

  if (error) return <p className="text-foreground dark:text-gray-300">Error fetching dashboard data</p>;

  // Type guard to check if data is PentesterMetrics
  const isPentesterData = (data: AdminMetrics | PentesterMetrics | ClientMetrics | undefined): data is PentesterMetrics => {
    return isPentester && data !== undefined && 'total_assigned_pentests' in data;
  };

  // Type guard to check if data is ClientMetrics
  const isClientData = (data: AdminMetrics | PentesterMetrics | ClientMetrics | undefined): data is ClientMetrics => {
    return isClient && data !== undefined && 'ongoingPentests' in data;
  };

  // Type guard to check if data is AdminMetrics
  const isAdminData = (data: AdminMetrics | PentesterMetrics | ClientMetrics | undefined): data is AdminMetrics => {
    return !isPentester && !isClient && data !== undefined && 'TotalClients' in data;
  };

  if (loading) return null

  // Get vulnerability data for chart
  const getVulnerabilityChartData = () => {
    if (isAdminData(dashboardData)) {
      return dashboardData.VulnerabilitiesByMonth;
    } else if (isClientData(dashboardData)) {
      return dashboardData.vulnerabilitiesByMonth;
    }
    return undefined;
  };

  // Client Dashboard - New Modern Layout
  if (isClient) {
    return (
      <div className="flex flex-col gap-4 flex-component self-stretch w-full text-foreground dark:text-gray-200 pb-6">
        {/* Top Row: Enhanced Metrics Cards - Always Visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 py-0 w-full gap-3 self-stretch">
          <EnhancedClientMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
        </div>

        {/* Main Content Area with Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Main Content - Collapsible Sections */}
          <div className="flex flex-col gap-4">
            {/* Risk Score & Vulnerability Analytics */}
            <CollapsibleSection title="Risk Assessment & Vulnerability Analytics" defaultExpanded={true}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <RiskScoreCard riskScore={isClientData(dashboardData) ? (dashboardData.overview?.riskScore || 0) : 0} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                  <VulnerabilityAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
                </div>
              </div>
            </CollapsibleSection>

            {/* Trends & Resolution Metrics */}
            <CollapsibleSection title="Trends & Resolution Metrics" defaultExpanded={true}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrendsSection data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
                <ResolutionMetrics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
              </div>
            </CollapsibleSection>

            {/* Service Type Analytics */}
            <CollapsibleSection title="Service Type Analytics" defaultExpanded={true}>
              <ServiceTypeAnalytics data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
            </CollapsibleSection>

            {/* Insights Panel */}
            <CollapsibleSection title="Insights & Recommendations" defaultExpanded={true}>
              <InsightsPanel data={isClientData(dashboardData) ? dashboardData : undefined} isLoading={isLoading} />
            </CollapsibleSection>

            {/* Penetration Tests List */}
            {isClientData(dashboardData) && dashboardData.pentests && dashboardData.pentests.length > 0 && (
              <CollapsibleSection title="Penetration Tests" defaultExpanded={true}>
                <ClientPentestsView pentests={dashboardData.pentests} />
              </CollapsibleSection>
            )}
          </div>

          {/* Sticky Sidebar - Activity Feed */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <ActivityFeedSection />
            </div>
          </div>
        </div>

        {/* Activity Feed for Mobile - Below main content */}
        <div className="lg:hidden">
          <ActivityFeedSection />
        </div>
      </div>
    );
  }

  // Pentester Dashboard (unchanged)
  if (isPentester) {
    return (
      <div className="flex flex-col gap-6 flex-component self-stretch w-full text-foreground dark:text-gray-200">
        {/* Top metrics cards section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 py-0 w-full gap-3 sm:gap-6 self-stretch">
          <MetricsCards 
            isPentester={isPentester} 
            isClient={isClient}
            isLoading={isLoading}
            pentesterData={isPentesterData(dashboardData) ? dashboardData : undefined}
            adminData={isAdminData(dashboardData) ? dashboardData : undefined}
            clientData={isClientData(dashboardData) ? dashboardData : undefined}
          />
        </div>

        {/* Middle section - conditional charts/reports and activity feed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-0 items-center min-h-[50vh]">
          <OngoingPentests 
            isLoading={dashboardLoading} 
            pentests={isPentesterData(dashboardData) ? dashboardData.Ongoing_pentests : undefined} 
          />
          <ActivityFeedSection />
        </div>

        {/* Bottom section - pentester impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center self-stretch shadow-6 dark:shadow-gray-800">
          <PentesterImpactSection 
            isLoading={dashboardLoading}
            vulnerabilityCounts={isPentesterData(dashboardData) ? dashboardData.total_vulnerabilities : undefined}
            criticalCount={isPentesterData(dashboardData) ? dashboardData.Critical_vulnerabilities_count : undefined}
            pentesterRank={isPentesterData(dashboardData) ? dashboardData.pentester_rank : undefined}
          />
        </div>
      </div>
    );
  }

  // Admin Dashboard (unchanged)
  return (
    <div className="flex flex-col gap-6 flex-component self-stretch w-full text-foreground dark:text-gray-200">
      {/* Top metrics cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 py-0 w-full gap-3 sm:gap-6 self-stretch">
        <MetricsCards 
          isPentester={isPentester} 
          isClient={isClient}
          isLoading={isLoading}
          pentesterData={isPentesterData(dashboardData) ? dashboardData : undefined}
          adminData={isAdminData(dashboardData) ? dashboardData : undefined}
          clientData={isClientData(dashboardData) ? dashboardData : undefined}
        />
      </div>

      {/* Middle section - charts and activity feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-0 items-center min-h-[50vh]">
        <VulnerabilityReportChart 
          isLoading={dashboardLoading} 
          data={getVulnerabilityChartData()}
        />
        <ActivityFeedSection />
      </div>

      {/* Bottom section - pentest list */}
      <PentestsListSection isLoading={dashboardLoading} />
    </div>
  );
}

export default DashboardHome;
