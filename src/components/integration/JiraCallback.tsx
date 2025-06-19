import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRoutes } from '@/lib/routes';
import axiosInstance from '@/lib/AxiosInstance';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

type CallbackStatus = 'loading' | 'success' | 'error';

const JiraCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [result, setResult] = useState<any>(null);
  const hasProcessedCallback = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prevent duplicate calls
    if (hasProcessedCallback.current) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processed immediately to prevent race conditions
      hasProcessedCallback.current = true;

      try {
        // Extract parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          console.error('OAuth Error:', error);
          setStatus('error');
          toast({
            title: "Authorization Failed",
            description: `Jira authorization was denied: ${error}`,
            variant: "destructive",
          });
          return;
        }

        // Check for required parameters
        if (!code || !state) {
          console.error('Missing required parameters - code:', code, 'state:', state);
          setStatus('error');
          toast({
            title: "Authorization Failed",
            description: "Missing authorization code or state parameter.",
            variant: "destructive",
          });
          return;
        }

        console.log('Received OAuth callback with code:', code);
        console.log('State parameter:', state);

        // Make callback request to exchange code for tokens
        const callbackUrl = `${apiRoutes.client.integrations.jira.callback}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        
        console.log('Making callback request to:', callbackUrl);
        
        const response = await axiosInstance.post(callbackUrl);
        
        console.log('Callback response:', response.data);
        
        setResult(response.data);
        setStatus('success');
        
        toast({
          title: "Jira Connected Successfully!",
          description: "Your Jira integration has been set up successfully.",
        });

        // Invalidate query cache to refresh organization data
        queryClient.invalidateQueries({ queryKey: ['client-organization'] });

        // Redirect to Jira setup page after 3 seconds
        setTimeout(() => {
          navigate('/integrations/jira/setup', { 
            state: { fromCallback: true, justConnected: true } 
          });
        }, 3000);

      } catch (error: any) {
        console.error('Error during Jira callback:', error);
        setStatus('error');
        setResult(error.response?.data || error.message);
        
        toast({
          title: "Connection Failed",
          description: "Failed to complete Jira integration. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleCallback();
  }, []); // Empty dependency array to only run once

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connecting to Jira...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Please wait while we complete your Jira integration.
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Jira Connected Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Your Jira integration has been set up. You'll be redirected to the integrations page shortly.
            </p>
            <Button onClick={() => navigate('/integrations/jira/setup', { 
              state: { fromCallback: true, justConnected: true } 
            })}>
              Go to Jira Setup
            </Button>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-12 h-12 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              We couldn't complete your Jira integration. Please try again.
            </p>
            {result && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Error: {JSON.stringify(result, null, 2)}
                </p>
              </div>
            )}
            <Button onClick={() => navigate('/integration')}>
              Back to Integrations
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default JiraCallback; 