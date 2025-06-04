import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRoutes } from '@/lib/routes';
import axiosInstance from '@/lib/AxiosInstance';
import { useUser } from '@/hooks/useUser';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Client } from '@/types/types';

const IntegrationsPage: React.FC = () => {
  const { isClient, loading: userLoading } = useUser();
  const navigate = useNavigate();

  // Fetch client organization information for client users
  const { data: clientOrganization, refetch: refetchOrganization, isLoading: organizationLoading } = useQuery({
    queryKey: ['client-organization'],
    queryFn: () => axiosInstance.get(apiRoutes.client.organization).then((res) => res.data as Client),
    enabled: isClient() && !userLoading, // Only fetch if user is loaded and is a client
  });
  console.log(clientOrganization);
  // Calculate unified loading state
  const isLoading = userLoading || (isClient() && organizationLoading);

  // Refetch organization data when page becomes visible (useful when returning from OAuth)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isClient()) {
        refetchOrganization();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isClient, refetchOrganization]);

  const handleConnectToJira = async () => {
    try {
      // For client users, use the organization ID from the fetched data
      const clientId = clientOrganization?._id;
      
      if (!clientId) {
        toast({
          title: "Error",
          description: "Client information not found. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Initiating Jira integration for client:', clientId);
      
      // Call the initiate Jira integration API
      // The backend should set redirect_uri to: http://localhost:5173/clients/integrations/jira/callback
      const response = await axiosInstance.post(apiRoutes.client.integrations.jira.initiate(clientId));
      
      console.log('Initiate Jira integration response:', response.data);
      
      if (response.data?.url) {
        console.log('Redirecting to Jira OAuth URL:', response.data.url);
        // replace the redirect_uri to the /clients/integrations/jira/callback
        const url = new URL(response.data.url);
        url.searchParams.set('redirect_uri', 'http://localhost:5173/clients/integrations/jira/callback');
        response.data.url = url.toString();
        
        // Redirect to Jira OAuth authorization URL
        window.location.href = response.data.url;
      } else {
        console.error('No OAuth URL received from backend');
        toast({
          title: "Error",
          description: "Failed to initiate Jira integration. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error connecting to Jira:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Jira. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEditJiraConfiguration = () => {
    // Navigate to setup wizard in edit mode
    navigate('/integration/jira/setup', { state: { editMode: true } });
  };

  const handleDisconnectJira = async () => {
    try {
      const clientId = clientOrganization?._id;
      
      if (!clientId) {
        toast({
          title: "Error",
          description: "Client information not found. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      await axiosInstance.delete(apiRoutes.client.integrations.jira.disconnect(clientId));
      
      toast({
        title: "Disconnected",
        description: "Jira integration has been disconnected successfully.",
      });
      
      // Refetch organization data to update integration status
      refetchOrganization();
    } catch (error) {
      console.error('Error disconnecting Jira:', error);
      toast({
        title: "Disconnection Failed",
        description: "Unable to disconnect Jira. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Skeleton component for loading state
  const IntegrationCardSkeleton = () => (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col items-start space-y-4">
          {/* Logo skeleton */}
          <Skeleton className="w-12 h-12 rounded-lg" />
          
          {/* Title skeleton */}
          <Skeleton className="h-6 w-16" />
          
          {/* Description skeleton */}
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Button skeleton */}
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Integration
      </h1>
      
      {/* Show loading state while user data or organization data is loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IntegrationCardSkeleton />
        </div>
      ) : !isClient() ? (
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Integrations Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Integration features are only available for client users.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col items-start space-y-4">
                {/* Jira Logo */}
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <img src="/Jira Icon.svg" alt="Jira" className="w-12 h-12" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Jira
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Turn your pentest vulnerabilities into Jira Stories, Epics, Tasks, or Bugs 
                  automatically. Fully customizable and just one click to connect.
                </p>
                
                {/* Connection Status */}
                {clientOrganization?.integrations?.jira && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Connected
                    </span>
                  </div>
                )}
                
                {/* Connect/Disconnect Button */}
                {clientOrganization?.integrations?.jira ? (
                  <div className='grid grid-cols-2 gap-2'>
                  <Button 
                    onClick={handleDisconnectJira}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Disconnect Jira
                  </Button>
                  <Button 
                    onClick={handleEditJiraConfiguration}
                  >
                    Edit Jira Configuration
                  </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleConnectToJira}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Connect to Jira Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
