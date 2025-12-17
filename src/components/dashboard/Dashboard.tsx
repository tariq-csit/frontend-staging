import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useUser } from "@/hooks/useUser";
import { PentesterMetrics, AdminMetrics } from "./components/types";
import {
  MetricsCards,
  OngoingPentests,
  VulnerabilityReportChart,
  ActivityFeedSection,
  PentesterImpactSection,
  PentestsListSection,
} from "./components";

function DashboardHome() {
  const { user, loading } = useUser();
  const isPentester = user?.role === 'pentester';

  // Admin/Pentester dashboard data fetching
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useQuery<AdminMetrics | PentesterMetrics>({
    queryKey: ["DashboardData"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(isPentester ? apiRoutes.pentester.dashboard : apiRoutes.dashboard);
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
  const isPentesterData = (data: AdminMetrics | PentesterMetrics | undefined): data is PentesterMetrics => {
    return isPentester && data !== undefined && 'total_assigned_pentests' in data;
  };

  // Type guard to check if data is AdminMetrics
  const isAdminData = (data: AdminMetrics | PentesterMetrics | undefined): data is AdminMetrics => {
    return !isPentester && data !== undefined && 'TotalClients' in data;
  };

  if (loading) return null

  // Get vulnerability data for chart
  const getVulnerabilityChartData = () => {
    if (isAdminData(dashboardData)) {
      return dashboardData.VulnerabilitiesByMonth;
    }
    return undefined;
  };

  // Pentester Dashboard (unchanged)
  if (isPentester) {
    return (
      <div className="flex flex-col gap-6 flex-component self-stretch w-full text-foreground dark:text-gray-200">
        {/* Top metrics cards section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 py-0 w-full gap-3 sm:gap-6 self-stretch">
          <MetricsCards 
            isPentester={isPentester} 
            isClient={false}
            isLoading={isLoading}
            pentesterData={isPentesterData(dashboardData) ? dashboardData : undefined}
            adminData={isAdminData(dashboardData) ? dashboardData : undefined}
          />
        </div>

        {/* Middle section - conditional charts/reports and activity feed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-0 items-center min-h-[50vh]">
          <OngoingPentests 
            isLoading={dashboardLoading} 
            pentests={isPentesterData(dashboardData) ? dashboardData.Ongoing_pentests : undefined} 
          />
          <ActivityFeedSection compact={true} />
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
          isClient={false}
          isLoading={isLoading}
          pentesterData={isPentesterData(dashboardData) ? dashboardData : undefined}
          adminData={isAdminData(dashboardData) ? dashboardData : undefined}
        />
      </div>

      {/* Middle section - charts and activity feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-0 items-start">
        <VulnerabilityReportChart 
          isLoading={dashboardLoading} 
          data={getVulnerabilityChartData()}
        />
        <ActivityFeedSection compact={true} />
      </div>

      {/* Bottom section - pentest list */}
      <PentestsListSection isLoading={dashboardLoading} />
    </div>
  );
}

export default DashboardHome;
