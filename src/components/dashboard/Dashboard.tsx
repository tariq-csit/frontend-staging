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
  ClientPentestsView
} from "./components";

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
      const response = await axiosInstance.get(isPentester ? apiRoutes.pentester.dashboard : isClient ? apiRoutes.client.dashboard : apiRoutes.dashboard);
      return response.data;
    },
    enabled: !loading 
  });

  console.log(dashboardData);

  // Role-specific loading states
  const isLoading = dashboardLoading;
  const error = dashboardError;

  if (error) return <p>Error fetching dashboard data</p>;

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

  return (
    <div className="flex flex-col gap-6 flex-component self-stretch w-full">
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
        {isPentester ? (
          <OngoingPentests 
            isLoading={dashboardLoading} 
            pentests={isPentesterData(dashboardData) ? dashboardData.Ongoing_pentests : undefined} 
          />
        ) : (
          <VulnerabilityReportChart 
            isLoading={dashboardLoading} 
            data={getVulnerabilityChartData()}
          />
        )}

        {/* Activity Feed (shared by both roles) */}
        <ActivityFeedSection />
      </div>

      {/* Bottom section - conditional pentester impact or admin's pentest list */}
      {isPentester ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center self-stretch shadow-6">
          <PentesterImpactSection 
            isLoading={dashboardLoading}
            vulnerabilityCounts={isPentesterData(dashboardData) ? dashboardData.total_vulnerabilities : undefined}
            criticalCount={isPentesterData(dashboardData) ? dashboardData.Critical_vulnerabilities_count : undefined}
            pentesterRank={isPentesterData(dashboardData) ? dashboardData.pentester_rank : undefined}
          />
        </div>
      ) : (
        isClient ? (
          <div>
            {isClientData(dashboardData) && dashboardData.pentests && (
              <ClientPentestsView pentests={dashboardData.pentests} />
            )}
          </div>
        ) : (
          <PentestsListSection isLoading={dashboardLoading} />
        )
      )}
    </div>
  );
}

export default DashboardHome;
