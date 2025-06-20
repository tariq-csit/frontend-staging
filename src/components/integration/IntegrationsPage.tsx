import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
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
  const [isConnectingToJira, setIsConnectingToJira] = React.useState(false);

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
    setIsConnectingToJira(true);
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
      
      const response = await axiosInstance.post(apiRoutes.client.integrations.jira.initiate(clientId));
      
      console.log('Initiate Jira integration response:', response.data);
      
      if (response.data?.url) {
        console.log('Redirecting to Jira OAuth URL:', response.data.url);
        // replace the redirect_uri to the /clients/integrations/jira/callback
        const url = new URL(response.data.url);
        url.searchParams.set('redirect_uri', `${import.meta.env.VITE_SLASH_URL}/clients/integrations/jira/callback`);
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
    } finally {
      setIsConnectingToJira(false);
    }
  };

  const handleEditJiraConfiguration = () => {
    // Navigate to setup wizard in edit mode
    navigate('/integrations/jira/setup', { state: { editMode: true } });
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
          {/* Jira Integration */}
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
                    disabled={isConnectingToJira}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnectingToJira ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect to Jira Now'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 relative">
            <CardContent className="p-6">
              <div className="flex flex-col items-start space-y-4">
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Coming Soon
                  </span>
                </div>
                
                {/* Slack Logo */}
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.521-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.523 2.521h-2.521V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.521h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
                  </svg>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Slack
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Get real-time notifications about pentest progress, vulnerability discoveries, 
                  and status updates directly in your Slack channels.
                </p>
                
                {/* Coming Soon Button */}
                <Button 
                  disabled
                  className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ClickUp Integration */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 relative">
            <CardContent className="p-6">
              <div className="flex flex-col items-start space-y-4">
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    Coming Soon
                  </span>
                </div>
                
                {/* ClickUp Logo */}
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M2 18.439C2 19.845 3.115 21 4.522 21h14.956C21.885 21 23 19.845 23 18.439V5.56C23 4.155 21.885 3 20.478 3H4.522C3.115 3 2 4.155 2 5.561v12.878zm7.707-9.707l2.586 2.586a1 1 0 001.414 0l4.293-4.293a1 1 0 111.414 1.414L14.121 13.732a3 3 0 01-4.242 0L7.293 11.146a1 1 0 111.414-1.414z" fill="#7B68EE"/>
                  </svg>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  ClickUp
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sync vulnerabilities as tasks in ClickUp with automatic priority assignment, 
                  custom fields, and seamless workflow integration.
                </p>
                
                {/* Coming Soon Button */}
                <Button 
                  disabled
                  className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
