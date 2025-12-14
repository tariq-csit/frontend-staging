import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type CallbackStatus = 'loading' | 'success' | 'error';

const SlackCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Backend handles the OAuth callback and redirects here
    // Check for success or error query parameters from backend redirect
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error || success === 'false') {
      // Explicit error from backend
      const msg = message || error || 'Failed to complete Slack integration. Please try again.';
      setStatus('error');
      setErrorMessage(msg);
      toast({
        title: "Connection Failed",
        description: msg,
        variant: "destructive",
      });
    } else {
      // Assume success if backend redirected here without error
      setStatus('success');
      toast({
        title: "Slack Connected Successfully!",
        description: "Your Slack integration has been set up successfully.",
      });

      // Invalidate query cache to refresh organization data and Slack status
      queryClient.invalidateQueries({ queryKey: ['client-organization'] });
      queryClient.invalidateQueries({ queryKey: ['slack-integration-status'] });

      // Redirect to Slack setup page after 3 seconds
      setTimeout(() => {
        navigate('/integrations/slack/setup');
      }, 3000);
    }
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Processing...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Please wait while we complete your Slack integration setup.
              </p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Successfully Connected!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Your Slack integration has been successfully connected. Redirecting to setup page...
              </p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connection Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                {errorMessage || 'We couldn\'t complete your Slack integration. Please try again.'}
              </p>
              <button
                onClick={() => navigate('/integrations')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Return to Integrations
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SlackCallback;

