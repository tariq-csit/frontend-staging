import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRoutes } from '@/lib/routes';
import axiosInstance from '@/lib/AxiosInstance';
import { useUser } from '@/hooks/useUser';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, CheckCircle2, X, Bell, MessageSquare, Settings, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { Client, Pentest } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface SlackIntegrationStatus {
  isIntegrated: boolean;
  teamName?: string;
  notificationSettings: {
    vulnerabilitySubmitted: boolean;
    statusChanged: boolean;
    commentAdded: boolean;
    pentestStatusChanged: boolean;
    reportPublished: boolean;
    severityFilter: string[];
  };
  pentests: {
    linked: Array<{
      id: string;
      name: string;
      status: string;
      channelId: string;
      channelName: string;
      enabled: boolean;
    }>;
    unlinked: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  };
}

const SEVERITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'] as const;

const SlackSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isClient, loading: userLoading } = useUser();

  // Check if we came from the callback
  const fromCallback = location.state?.fromCallback;
  const justConnected = location.state?.justConnected;
  const clientIdFromState = location.state?.clientId;

  // Fetch client organization information
  const { data: clientOrganization, isLoading: organizationLoading, refetch: refetchOrganization } = useQuery({
    queryKey: ['client-organization'],
    queryFn: () => axiosInstance.get(apiRoutes.client.organization).then((res) => res.data as Client),
    enabled: isClient() && !userLoading,
  });

  const clientId = clientIdFromState || clientOrganization?._id;

  // Calculate unified loading state
  const isMainLoading = userLoading || (isClient() && organizationLoading);

  // Fetch Slack integration status
  const { data: slackStatus, isLoading: statusLoading, refetch: refetchSlackStatus } = useQuery<SlackIntegrationStatus>({
    queryKey: ['slack-integration-status', clientId],
    queryFn: () => {
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.get(apiRoutes.client.integrations.slack.status(clientId)).then((res) => res.data);
    },
    enabled: !!clientId && (clientOrganization?.integrations?.slack || justConnected),
  });

  // Fetch Slack channels
  const { data: channelsData, isLoading: channelsLoading, refetch: refetchChannels } = useQuery<{ channels: SlackChannel[] }>({
    queryKey: ['slack-channels', clientId],
    queryFn: () => {
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.get(apiRoutes.client.integrations.slack.channels(clientId)).then((res) => res.data);
    },
    enabled: !!clientId && (slackStatus?.isIntegrated || justConnected),
  });

  // Fetch client pentests
  const { data: allPentests, isLoading: pentestsLoading } = useQuery<Pentest[]>({
    queryKey: ['client-pentests'],
    queryFn: () => axiosInstance.get(apiRoutes.client.pentests.all).then((res) => res.data),
    enabled: !!clientId && (slackStatus?.isIntegrated || justConnected),
  });

  // Dialog state for linking pentest to channel
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPentestForLink, setSelectedPentestForLink] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [selectedChannelName, setSelectedChannelName] = useState<string>('');

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<SlackIntegrationStatus['notificationSettings']>({
    vulnerabilitySubmitted: true,
    statusChanged: true,
    commentAdded: true,
    pentestStatusChanged: true,
    reportPublished: true,
    severityFilter: [],
  });

  // Initialize notification settings from status
  useEffect(() => {
    if (slackStatus?.notificationSettings) {
      setNotificationSettings({
        ...slackStatus.notificationSettings,
        severityFilter: slackStatus.notificationSettings.severityFilter || [],
      });
    }
  }, [slackStatus]);

  // Mutation to link pentest to channel
  const linkPentestMutation = useMutation({
    mutationFn: async ({ pentestId, channelId, channelName }: { pentestId: string; channelId: string; channelName: string }) => {
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.post(
        apiRoutes.client.integrations.slack.linkPentest(clientId, pentestId),
        { channelId, channelName }
      );
    },
    onSuccess: (response) => {
      const data = response.data;
      const message = data?.message || "Channel linked successfully";
      const warning = data?.warning;
      const botInChannel = data?.botInChannel;
      const isPrivateChannel = data?.isPrivateChannel;

      // Show success toast
      toast({
        title: "Channel linked",
        description: message,
      });

      // Show warning toast if present (for private channels or failed auto-join)
      if (warning) {
        toast({
          title: "Action Required",
          description: warning,
          variant: "default",
          duration: 10000, // Show for 10 seconds
        });
      }

      setLinkDialogOpen(false);
      setSelectedPentestForLink(null);
      setSelectedChannelId('');
      setSelectedChannelName('');
      queryClient.invalidateQueries({ queryKey: ['slack-integration-status', clientId] });
      queryClient.invalidateQueries({ queryKey: ['slack-channels', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-organization'] });
    },
    onError: (error: any) => {
      toast({
        title: "Link failed",
        description: error.response?.data?.message || "Failed to link pentest to channel. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update notification settings
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SlackIntegrationStatus['notificationSettings']>) => {
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.put(
        apiRoutes.client.integrations.slack.updateNotifications(clientId),
        settings
      );
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['slack-integration-status', clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.response?.data?.message || "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveNotificationSettings = () => {
    saveNotificationSettingsMutation.mutate(notificationSettings);
  };

  const handleOpenLinkDialog = (pentestId: string) => {
    setSelectedPentestForLink(pentestId);
    setLinkDialogOpen(true);
  };

  const handleLinkPentest = () => {
    if (!selectedPentestForLink || !selectedChannelId || !selectedChannelName) {
      toast({
        title: "Missing information",
        description: "Please select a channel.",
        variant: "destructive",
      });
      return;
    }
    linkPentestMutation.mutate({
      pentestId: selectedPentestForLink,
      channelId: selectedChannelId,
      channelName: selectedChannelName,
    });
  };

  const handleUnlinkPentest = async (pentestId: string) => {
    if (!clientId) return;
    
    try {
      // For now, we'll need to implement unlink endpoint or handle it differently
      // Since the API doesn't specify unlink, we might need to link to a different channel or disable
      toast({
        title: "Note",
        description: "To unlink a pentest, please link it to a different channel or contact support.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlink pentest.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isMainLoading || statusLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Not integrated and not just connected
  if (!slackStatus?.isIntegrated && !justConnected) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Slack Not Connected
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please connect Slack integration first.
              </p>
              <Button onClick={() => navigate('/integrations')}>
                Go to Integrations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channels = channelsData?.channels || [];
  const linkedPentests = slackStatus?.pentests.linked || [];
  const unlinkedPentests = slackStatus?.pentests.unlinked || [];
  const allPentestsList = allPentests || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/integrations')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Slack Integration Setup
          </h1>
          {slackStatus?.teamName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connected to {slackStatus.teamName}
            </p>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure what events trigger Slack notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="vulnerability-submitted">Vulnerability Submitted</Label>
            <Switch
              id="vulnerability-submitted"
              checked={notificationSettings.vulnerabilitySubmitted}
              onCheckedChange={(checked) =>
                setNotificationSettings(prev => ({ ...prev, vulnerabilitySubmitted: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="status-changed">Vulnerability Status Changed</Label>
            <Switch
              id="status-changed"
              checked={notificationSettings.statusChanged}
              onCheckedChange={(checked) =>
                setNotificationSettings(prev => ({ ...prev, statusChanged: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comment-added">Comment Added</Label>
            <Switch
              id="comment-added"
              checked={notificationSettings.commentAdded}
              onCheckedChange={(checked) =>
                setNotificationSettings(prev => ({ ...prev, commentAdded: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pentest-status-changed">Pentest Status Changed</Label>
            <Switch
              id="pentest-status-changed"
              checked={notificationSettings.pentestStatusChanged}
              onCheckedChange={(checked) =>
                setNotificationSettings(prev => ({ ...prev, pentestStatusChanged: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="report-published">Report Published</Label>
            <Switch
              id="report-published"
              checked={notificationSettings.reportPublished}
              onCheckedChange={(checked) =>
                setNotificationSettings(prev => ({ ...prev, reportPublished: checked }))
              }
            />
          </div>
          
          {/* Severity Filter */}
          <div className="pt-4 border-t space-y-3">
            <div>
              <Label className="text-base font-medium">Severity Filter</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Only receive notifications for selected severities. Leave empty to receive all severities.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SEVERITY_OPTIONS.map((severity) => (
                <div key={severity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`severity-${severity.toLowerCase()}`}
                    checked={(notificationSettings.severityFilter || []).includes(severity)}
                    onCheckedChange={(checked) => {
                      setNotificationSettings(prev => {
                        const currentFilter = prev.severityFilter || [];
                        if (checked) {
                          // Add severity if not already present
                          if (!currentFilter.includes(severity)) {
                            return {
                              ...prev,
                              severityFilter: [...currentFilter, severity],
                            };
                          }
                          return prev;
                        } else {
                          // Remove severity
                          return {
                            ...prev,
                            severityFilter: currentFilter.filter(s => s !== severity),
                          };
                        }
                      });
                    }}
                  />
                  <Label
                    htmlFor={`severity-${severity.toLowerCase()}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {severity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleSaveNotificationSettings}
              disabled={saveNotificationSettingsMutation.isPending}
              className="w-full"
            >
              {saveNotificationSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Linked Pentests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Linked Pentests
          </CardTitle>
          <CardDescription>
            Pentests that are connected to Slack channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedPentests.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No pentests linked yet. Link a pentest below to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {linkedPentests.map((pentest) => (
                <div
                  key={pentest.id}
                  className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {pentest.name}
                      </h3>
                      <Badge variant="secondary">{pentest.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Channel: #{pentest.channelName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={pentest.enabled}
                      onCheckedChange={(checked) => {
                        // Handle enable/disable - might need API endpoint
                        toast({
                          title: "Coming soon",
                          description: "Enable/disable feature will be available soon.",
                        });
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLinkDialog(pentest.id)}
                    >
                      Change Channel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlinked Pentests */}
      {unlinkedPentests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Pentests</CardTitle>
            <CardDescription>
              Link pentests to Slack channels to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlinkedPentests.map((pentest) => (
                <div
                  key={pentest.id}
                  className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {pentest.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {pentest.status}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleOpenLinkDialog(pentest.id)}
                  >
                    Link to Channel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Pentest to Channel</DialogTitle>
            <DialogDescription>
              Select a Slack channel to receive notifications for this pentest
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {channelsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-2">
                <Label>Select Channel</Label>
                <Select
                  value={selectedChannelId}
                  onValueChange={(value) => {
                    setSelectedChannelId(value);
                    const channel = channels.find(c => c.id === value);
                    if (channel) {
                      setSelectedChannelName(channel.name);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        #{channel.name} {channel.isPrivate && '(Private)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedChannelId && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Channel Information:</p>
                        {channels.find(c => c.id === selectedChannelId)?.isPrivate ? (
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>This is a private channel</li>
                            <li>You'll need to manually invite the bot using <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/invite @SLASH</code> in the channel</li>
                            <li>Thread replies and notifications won't work until the bot is invited</li>
                          </ul>
                        ) : (
                          <p className="text-xs">The bot will automatically join this public channel when you link it.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLinkDialogOpen(false);
                setSelectedPentestForLink(null);
                setSelectedChannelId('');
                setSelectedChannelName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkPentest}
              disabled={!selectedChannelId || linkPentestMutation.isPending}
            >
              {linkPentestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link Channel'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SlackSetup;

