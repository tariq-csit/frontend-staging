import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRoutes } from '@/lib/routes';
import axiosInstance from '@/lib/AxiosInstance';
import { useUser } from '@/hooks/useUser';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Target, Settings, Calendar, Zap, CheckCircle2, Square } from 'lucide-react';
import { Client } from '@/types/types';
import JiraSetupLayout from './JiraSetupLayout';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
}

interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
}

const JiraSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isClient, loading: userLoading } = useUser();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedIssueType, setSelectedIssueType] = useState<string>('');

  // Check if we came from the callback
  const fromCallback = location.state?.fromCallback;
  const justConnected = location.state?.justConnected;

  // Fetch client organization information
  const { data: clientOrganization, isLoading: organizationLoading } = useQuery({
    queryKey: ['client-organization'],
    queryFn: () => axiosInstance.get(apiRoutes.client.organization).then((res) => res.data as Client),
    enabled: isClient() && !userLoading, // Wait for user to load
  });

  // Calculate unified loading state
  const isMainLoading = userLoading || (isClient() && organizationLoading);

  // If we just connected but the integration status hasn't updated yet, proceed anyway
  const isIntegratedOrJustConnected = clientOrganization?.integrations?.jira?.isIntegrated || justConnected;

  // Fetch Jira projects
  const { data: jiraProjectsResponse, isLoading: projectsLoading } = useQuery({
    queryKey: ['jira-projects'],
    queryFn: () => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.get(apiRoutes.client.integrations.jira.projects(clientId)).then((res) => res.data);
    },
    enabled: !!clientOrganization?._id && isIntegratedOrJustConnected,
  });

  // Extract projects array from response (handle different response structures)
  const jiraProjects = React.useMemo(() => {
    if (!jiraProjectsResponse) return [];
    
    // If response is already an array
    if (Array.isArray(jiraProjectsResponse)) return jiraProjectsResponse;
    
    // If response has projects property
    if (jiraProjectsResponse.projects && Array.isArray(jiraProjectsResponse.projects)) {
      return jiraProjectsResponse.projects;
    }
    
    // If response has data property
    if (jiraProjectsResponse.data && Array.isArray(jiraProjectsResponse.data)) {
      return jiraProjectsResponse.data;
    }
    
    // If response has values property (Atlassian API often uses this)
    if (jiraProjectsResponse.values && Array.isArray(jiraProjectsResponse.values)) {
      return jiraProjectsResponse.values;
    }
    
    console.warn('Unexpected Jira projects response structure:', jiraProjectsResponse);
    return [];
  }, [jiraProjectsResponse]);

  // Fetch Jira issue types for the selected project
  const { data: jiraIssueTypesResponse, isLoading: issueTypesLoading } = useQuery({
    queryKey: ['jira-issue-types', selectedProject],
    queryFn: () => {
      const clientId = clientOrganization?._id;
      if (!clientId || !selectedProject) throw new Error('Client ID or project key not found');
      return axiosInstance.get(apiRoutes.client.integrations.jira.issueTypes(clientId, selectedProject)).then((res) => res.data);
    },
    enabled: !!clientOrganization?._id && !!selectedProject && isIntegratedOrJustConnected,
  });

  // Extract issue types array from response
  const jiraIssueTypes = React.useMemo(() => {
    if (!jiraIssueTypesResponse) return [];
    
    // If response is already an array
    if (Array.isArray(jiraIssueTypesResponse)) return jiraIssueTypesResponse;
    
    // If response has issueTypes property
    if (jiraIssueTypesResponse.issueTypes && Array.isArray(jiraIssueTypesResponse.issueTypes)) {
      return jiraIssueTypesResponse.issueTypes;
    }
    
    // If response has data property
    if (jiraIssueTypesResponse.data && Array.isArray(jiraIssueTypesResponse.data)) {
      return jiraIssueTypesResponse.data;
    }
    
    // If response has values property
    if (jiraIssueTypesResponse.values && Array.isArray(jiraIssueTypesResponse.values)) {
      return jiraIssueTypesResponse.values;
    }
    
    console.warn('Unexpected Jira issue types response structure:', jiraIssueTypesResponse);
    return [];
  }, [jiraIssueTypesResponse]);

  const saveConfiguration = useMutation({
    mutationFn: async (config: { projectKey: string; issueType: string; autoSendToJira: boolean }) => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      
      // This would be an API call to save the configuration
      // For now, we'll just simulate it
      console.log('Saving Jira configuration:', config);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Your Jira integration has been configured successfully.",
      });
      navigate('/integration');
    },
    onError: (error) => {
      console.error('Error saving configuration:', error);
      toast({
        title: "Configuration Failed",
        description: "Failed to save Jira configuration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Helper function to get icon for issue type
  const getIssueTypeIcon = (issueTypeName: string) => {
    const name = issueTypeName.toLowerCase();
    if (name.includes('bug')) return CheckCircle2;
    if (name.includes('epic')) return Zap;
    if (name.includes('story')) return Square;
    if (name.includes('task')) return CheckCircle2;
    return CheckCircle2; // Default icon
  };

  // Helper function to get color for issue type
  const getIssueTypeColor = (issueTypeName: string) => {
    const name = issueTypeName.toLowerCase();
    if (name.includes('bug')) return 'bg-red-500';
    if (name.includes('epic')) return 'bg-purple-500';
    if (name.includes('story')) return 'bg-green-500';
    if (name.includes('task')) return 'bg-blue-500';
    return 'bg-gray-500'; // Default color
  };

  const handleNext = () => {
    if (!selectedProject) {
      toast({
        title: "Project Required",
        description: "Please select a Jira project to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedIssueType) {
      toast({
        title: "Issue Type Required",
        description: "Please select an issue type to continue.",
        variant: "destructive",
      });
      return;
    }

    saveConfiguration.mutate({
      projectKey: selectedProject,
      issueType: selectedIssueType,
      autoSendToJira: true
    });
  };

  const handleBack = () => {
    navigate('/integration');
  };

  // Clear issue type when project changes
  React.useEffect(() => {
    if (selectedProject) {
      setSelectedIssueType(''); // Clear issue type when project changes
    }
  }, [selectedProject]);

  if (isMainLoading && fromCallback) {
    // Show loading state when coming from callback and data is still loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Loading Jira Configuration...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Please wait while we load your Jira integration settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isMainLoading && !isIntegratedOrJustConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <Settings className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Jira Not Connected
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Please connect your Jira account first before configuring the integration.
            </p>
            <Button onClick={() => navigate('/integration')}>
              Go to Integrations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <JiraSetupLayout currentStep={1} isLoading={isMainLoading}>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {isMainLoading ? (
          <>
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-12 rounded-lg" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-6 w-48 mx-auto mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-12 rounded-lg" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-6 w-40 mx-auto mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex items-center space-x-3 flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Project Selection Card */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select your Project to Link
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Select the Jira project where vulnerabilities will be sent as issues.
                </p>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : jiraProjects && jiraProjects.length > 0 ? (
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your project" />
                    </SelectTrigger>
                    <SelectContent>
                      {jiraProjects.map((project: JiraProject) => (
                        <SelectItem key={project.id} value={project.key}>
                          {project.name} ({project.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No Jira projects found. Please make sure your Jira account has accessible projects or contact your administrator.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Issue Type Selection Card */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    <div className="h-12 w-12 rounded-lg bg-red-500 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <Square className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select your issue type
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Select the issue type you want all the vulnerabilities in the pentest to be saved as (i.e, bug, epic, story)
                </p>
              </CardHeader>
              <CardContent>
                {!selectedProject ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Please select a project first to see available issue types.
                    </p>
                  </div>
                ) : issueTypesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div className="flex items-center space-x-3 flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Skeleton className="h-6 w-6 rounded" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : jiraIssueTypes.length > 0 ? (
                  <RadioGroup value={selectedIssueType} onValueChange={setSelectedIssueType} className="space-y-3">
                    {jiraIssueTypes.map((type: JiraIssueType) => {
                      const Icon = getIssueTypeIcon(type.name);
                      return (
                        <div key={type.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label
                            htmlFor={type.id}
                            className={`flex items-center space-x-3 cursor-pointer flex-1 p-3 rounded-lg border transition-colors ${
                              selectedIssueType === type.id
                                ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className={`h-6 w-6 rounded ${getIssueTypeColor(type.name)} flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No issue types found for the selected project. Please check your project configuration in Jira.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {isMainLoading ? (
          <>
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </>
        ) : (
          <>
            <Button variant="outline" className="px-8" onClick={handleBack}>
              Back
            </Button>
            <Button 
              className="px-8 bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleNext}
              disabled={saveConfiguration.isPending || !selectedProject || !selectedIssueType}
            >
              {saveConfiguration.isPending ? 'Saving...' : 'Complete Setup'}
            </Button>
          </>
        )}
      </div>
    </JiraSetupLayout>
  );
};

export default JiraSetup; 