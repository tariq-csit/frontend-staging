import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useUser } from "@/hooks/useUser";
import { PentesterMetrics, AdminMetrics, ClientMetrics } from "../components/types";

export const useDashboardData = () => {
  const { user, loading } = useUser();
  const isPentester = user?.role === 'pentester';
  const isClient = user?.role === 'client';

  // Dashboard data fetching
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

  // Get vulnerability data for chart
  const getVulnerabilityChartData = () => {
    if (isAdminData(dashboardData)) {
      return dashboardData.VulnerabilitiesByMonth;
    } else if (isClientData(dashboardData)) {
      return dashboardData.vulnerabilitiesByMonth;
    }
    return undefined;
  };

  return {
    dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    loading,
    user,
    isPentester,
    isClient,
    isPentesterData,
    isClientData,
    isAdminData,
    getVulnerabilityChartData,
  };
};

