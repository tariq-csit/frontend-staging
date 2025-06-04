import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { MultiSelect } from '@/components/ui/multi-select';
import { Loader2, Target, Settings, Calendar, Zap, CheckCircle2, Square, ArrowRight, FileText, Shield, AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react';
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

interface JiraField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  allowedValues?: Array<{ id: string; value: string; self?: string }>;
  key: string;
  schema: {
    type: string;
    custom?: string;
    customId?: number;
    items?: string;
  };
}

interface SeverityMapping {
  [key: string]: string;
}

interface CustomFieldMapping {
  [fieldId: string]: any;
}

interface Pentest {
  _id: string;
  title: string;
  name?: string;
  pentestName?: string;
  projectName?: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface JiraSetupState {
  currentStep: number;
  selectedProject: string;
  selectedIssueType: string;
  severityMapping: SeverityMapping;
  customFieldMapping: CustomFieldMapping;
  mapAllRequiredFields: boolean;
  selectedPentests: string[];
  autoSyncPentests: string[];
}

const STORAGE_KEY = 'jira-setup-state';

const JiraSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isClient, loading: userLoading } = useUser();
  
  // Load state from localStorage or use defaults
  const loadSavedState = (): JiraSetupState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved Jira setup state:', error);
    }
    
    return {
      currentStep: 1,
      selectedProject: '',
      selectedIssueType: '',
      severityMapping: {},
      customFieldMapping: {},
      mapAllRequiredFields: false,
      selectedPentests: [],
      autoSyncPentests: []
    };
  };

  const [state, setState] = useState<JiraSetupState>(loadSavedState);

  // Destructure state for easier access
  const {
    currentStep,
    selectedProject,
    selectedIssueType,
    severityMapping,
    customFieldMapping,
    mapAllRequiredFields,
    selectedPentests,
    autoSyncPentests
  } = state;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save Jira setup state:', error);
    }
  }, [state]);

  // Helper function to update state
  const updateState = (updates: Partial<JiraSetupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

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
  console.log(jiraIssueTypesResponse)

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

  // Fetch Jira issue type fields for custom field mapping
  const { data: jiraFieldsResponse, isLoading: fieldsLoading } = useQuery({
    queryKey: ['jira-issue-fields', selectedProject, selectedIssueType],
    queryFn: () => {
      const clientId = clientOrganization?._id;
      if (!clientId || !selectedProject || !selectedIssueType) throw new Error('Missing required data');
      return axiosInstance.get(apiRoutes.client.integrations.jira.issueTypeFields(clientId, selectedProject, selectedIssueType)).then((res) => res.data);
    },
    enabled: !!clientOrganization?._id && !!selectedProject && !!selectedIssueType && isIntegratedOrJustConnected && currentStep >= 3,
  });

  // Extract and filter fields - only required custom fields
  const requiredCustomFields = React.useMemo(() => {
    if (!jiraFieldsResponse?.fields) return [];
    
    return jiraFieldsResponse.fields.filter((field: JiraField) => 
      field.required && 
      field.id.startsWith('customfield_')
    );
  }, [jiraFieldsResponse]);

  // Extract Jira priorities from the fields response
  const jiraPriorities = React.useMemo(() => {
    if (!jiraFieldsResponse?.fields) return [];
    
    const priorityField = jiraFieldsResponse.fields.find((field: JiraField) => 
      field.id === 'priority' || field.key === 'priority'
    );
    
    return priorityField?.allowedValues || [];
  }, [jiraFieldsResponse]);

  // Fetch client pentests for step 5
  const { data: clientPentests, isLoading: pentestsLoading } = useQuery({
    queryKey: ['client-pentests'],
    queryFn: () => axiosInstance.get(apiRoutes.client.pentests.all).then((res) => res.data as Pentest[]),
    enabled: !!clientOrganization?._id && isIntegratedOrJustConnected && currentStep >= 5,
  });

  const saveConfiguration = useMutation({
    mutationFn: async (config: { 
      projectKey: string; 
      issueType: string; 
      severityMapping: SeverityMapping; 
      customFields: CustomFieldMapping; 
      selectedPentests: string[];
      autoSyncPentests: string[];
      autoSendToJira: boolean 
    }) => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      
      // Clean severity mapping - only include Jira Priority ID → Slash Severity mappings
      const cleanSeverityMapping: { [key: string]: string } = {};
      Object.entries(config.severityMapping).forEach(([key, value]) => {
        // Only include mappings where key looks like a Jira priority ID (numeric or UUID-like)
        // and value is a valid Slash severity
        if (key && value && ['Critical', 'High', 'Medium', 'Low'].includes(value)) {
          // Skip if key looks like a Slash severity (to avoid the duplicate mappings)
          if (!['Critical', 'High', 'Medium', 'Low', 'Highest', 'Lowest'].includes(key)) {
            cleanSeverityMapping[key] = value;
          }
        }
      });
      
      // Transform custom field mapping into the expected API format
      const customFieldsArray = Object.entries(config.customFields)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldId, value]) => {
          // Find the field info to determine field type
          const field = requiredCustomFields.find((f: JiraField) => f.id === fieldId);
          let fieldType = 'text'; // default
          let valueType = 'static'; // default to static value
          let processedValue = value;
          
          if (field) {
            if (field.schema.custom?.includes('textarea')) {
              fieldType = 'textarea';
            } else if (field.schema.type === 'option') {
              fieldType = 'select';
            } else if (field.schema.type === 'array') {
              fieldType = 'multiselect';
              // For arrays, ensure it's an array
              if (!Array.isArray(processedValue)) {
                processedValue = [processedValue];
              }
            } else if (field.schema.type === 'user') {
              fieldType = 'user';
            } else if (field.schema.type === 'date') {
              fieldType = 'date';
            } else if (field.schema.type === 'datetime') {
              fieldType = 'datetime';
            } else if (field.schema.type === 'number') {
              fieldType = 'number';
              processedValue = Number(processedValue);
            }
          }
          
          return {
            jiraField: fieldId,
            fieldType: fieldType,
            valueType: valueType,
            value: processedValue
          };
        });

      const requestBody = {
        projectKey: config.projectKey,
        issueType: config.issueType,
        severityMapping: Object.keys(cleanSeverityMapping).length > 0 ? cleanSeverityMapping : null,
        customFields: customFieldsArray,
        selectedPentests: config.selectedPentests,
        autoSyncPentests: config.autoSyncPentests,
        autoSendToJira: config.autoSendToJira
      };

      console.log('Sending Jira configuration:', requestBody);
      console.log('Clean severity mapping:', cleanSeverityMapping);
      console.log('Custom fields array:', customFieldsArray);
      
      // First, save the main configuration
      const configResponse = await axiosInstance.post(apiRoutes.client.integrations.jira.configure(clientId), requestBody);
      
      // Then, enable auto-sync for selected pentests
      if (config.autoSyncPentests.length > 0) {
        console.log('Enabling auto-sync for pentests:', config.autoSyncPentests);
        
        const autoSyncPromises = config.autoSyncPentests.map(pentestId => 
          axiosInstance.post(apiRoutes.client.integrations.jira.autoSync(clientId, pentestId))
            .then(response => ({ success: true, pentestId, response }))
            .catch(error => {
              console.error(`Failed to enable auto-sync for pentest ${pentestId}:`, error);
              // Don't throw here, let the main configuration succeed even if some auto-sync requests fail
              return { success: false, pentestId, error: error.message };
            })
        );
        
        const autoSyncResults = await Promise.all(autoSyncPromises);
        const failedAutoSyncs = autoSyncResults.filter(result => !result.success);
        
        if (failedAutoSyncs.length > 0) {
          console.warn('Some auto-sync requests failed:', failedAutoSyncs);
        }
      }
      
      return configResponse.data;
    },
    onSuccess: () => {
      // Clear saved state on successful completion
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: "Configuration Saved",
        description: (autoSyncPentests || []).length > 0 
          ? `Your Jira integration has been configured successfully with auto-sync enabled for ${(autoSyncPentests || []).length} pentest${(autoSyncPentests || []).length !== 1 ? 's' : ''}.`
          : "Your Jira integration has been configured successfully.",
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

  // Helper function to render field input based on type
  const renderFieldInput = (field: JiraField) => {
    const fieldValue = customFieldMapping[field.id];

    switch (field.schema.type) {
      case 'string':
        if (field.schema.custom?.includes('textarea')) {
          return (
            <Textarea
              placeholder={`Enter ${field.name.toLowerCase()}`}
              value={fieldValue || ''}
              onChange={(e) => updateState({ 
                customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
              })}
              className="w-full"
            />
          );
        }
        return (
          <Input
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );

      case 'option':
        if (field.schema.custom?.includes('radiobuttons')) {
          return (
            <RadioGroup
              value={fieldValue || ''}
              onValueChange={(value) => updateState({ 
                customFieldMapping: { ...customFieldMapping, [field.id]: value }
              })}
              className="space-y-2"
            >
              {field.allowedValues?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`${field.id}-${option.id}`} />
                  <Label htmlFor={`${field.id}-${option.id}`}>{option.value}</Label>
                </div>
              ))}
            </RadioGroup>
          );
        }
        // Single select dropdown
        return (
          <Select
            value={fieldValue || ''}
            onValueChange={(value) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: value }
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.allowedValues?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'array':
        if (field.schema.items === 'option') {
          // Multi-checkbox
          return (
            <div className="space-y-2">
              {field.allowedValues?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.id}`}
                    checked={fieldValue?.includes(option.id) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = fieldValue || [];
                      if (checked) {
                        updateState({ 
                          customFieldMapping: { 
                            ...customFieldMapping, 
                            [field.id]: [...currentValues, option.id] 
                          }
                        });
                      } else {
                        updateState({ 
                          customFieldMapping: { 
                            ...customFieldMapping, 
                            [field.id]: currentValues.filter((val: string) => val !== option.id) 
                          }
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option.id}`}>{option.value}</Label>
                </div>
              ))}
            </div>
          );
        }
        // Array of strings (labels)
        return (
          <Input
            placeholder={`Enter ${field.name.toLowerCase()} (comma-separated)`}
            value={fieldValue?.join(', ') || ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              updateState({ 
                customFieldMapping: { ...customFieldMapping, [field.id]: values }
              });
            }}
            className="w-full"
          />
        );

      case 'user':
        return (
          <Input
            placeholder="Enter username"
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );

      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );

      default:
        return (
          <Input
            placeholder={`Enter ${field.name.toLowerCase()}`}
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { ...customFieldMapping, [field.id]: e.target.value }
            })}
            className="w-full"
          />
        );
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
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

      updateState({ currentStep: 2 });
    } else if (currentStep === 2) {
      // Move to step 3 (Severity Mapping)
      updateState({ currentStep: 3 });
    } else if (currentStep === 3) {
      // Move to step 4 (Custom Field Mapping) - mapping is optional
      updateState({ currentStep: 4 });
    } else if (currentStep === 4) {
      // Validate required custom fields if mapAllRequiredFields is enabled
      if (mapAllRequiredFields) {
        const unfilledRequiredFields = requiredCustomFields.filter((field: JiraField) => 
          !customFieldMapping[field.id] || 
          (Array.isArray(customFieldMapping[field.id]) && customFieldMapping[field.id].length === 0)
        );
        
        if (unfilledRequiredFields.length > 0) {
          toast({
            title: "Required Fields Missing",
            description: "Please fill in all required custom fields or disable 'Map All Required Fields'.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Move to step 5 (Link Pentest)
      updateState({ currentStep: 5 });
    } else if (currentStep === 5) {
      // Validate pentest selection
      if (selectedPentests.length === 0) {
        toast({
          title: "Pentests Required",
          description: "Please select at least one pentest to link with the Jira integration.",
          variant: "destructive",
        });
        return;
      }
      
      // Additional validation for required fields
      if (!selectedProject) {
        toast({
          title: "Missing Project",
          description: "Project selection is required. Please go back and select a project.",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedIssueType) {
        toast({
          title: "Missing Issue Type",
          description: "Issue type selection is required. Please go back and select an issue type.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Submitting configuration with:', {
        projectKey: selectedProject,
        issueType: selectedIssueType,
        severityMapping: severityMapping,
        customFields: customFieldMapping,
        selectedPentests: selectedPentests,
        autoSyncPentests: autoSyncPentests || []
      });
      
      // Final step - save configuration
      saveConfiguration.mutate({
        projectKey: selectedProject,
        issueType: selectedIssueType,
        severityMapping: severityMapping,
        customFields: customFieldMapping,
        selectedPentests: selectedPentests,
        autoSyncPentests: autoSyncPentests || [],
        autoSendToJira: true
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Clear saved state when going back to integrations
      localStorage.removeItem(STORAGE_KEY);
      navigate('/integration');
    } else {
      updateState({ currentStep: currentStep - 1 });
    }
  };

  // Clear issue type when project changes
  React.useEffect(() => {
    if (selectedProject) {
      updateState({ selectedIssueType: '' }); // Clear issue type when project changes
    }
  }, [selectedProject]);

  // Helper function to toggle auto-sync for a pentest
  const toggleAutoSync = (pentestId: string) => {
    const currentAutoSyncPentests = autoSyncPentests || [];
    const isCurrentlyEnabled = currentAutoSyncPentests.includes(pentestId);
    if (isCurrentlyEnabled) {
      updateState({ 
        autoSyncPentests: currentAutoSyncPentests.filter(id => id !== pentestId) 
      });
    } else {
      updateState({ 
        autoSyncPentests: [...currentAutoSyncPentests, pentestId] 
      });
    }
  };

  // Helper function to get pentest name
  const getPentestName = (pentestId: string) => {
    if (!clientPentests) return `Pentest ${pentestId.slice(-6)}`;
    const pentest = clientPentests.find((p: Pentest) => p._id === pentestId);
    if (!pentest) return `Pentest ${pentestId.slice(-6)}`;
    return pentest.title || pentest.name || pentest.pentestName || pentest.projectName || `Pentest ${pentestId.slice(-6)}`;
  };

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

  const renderStep1 = () => (
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
                <Select value={selectedProject} onValueChange={(value) => updateState({ selectedProject: value })}>
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
                <RadioGroup value={selectedIssueType} onValueChange={(value) => updateState({ selectedIssueType: value })} className="space-y-3">
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
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Jira Fields Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-blue-500 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Jira Fields
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            these are fields that are in your Jira story
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Field */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">this is the story summary</p>
          </div>

          {/* Overview Field */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Overview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">a brief overview of the main themes</p>
          </div>

          {/* Analysis Field */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">an in-depth look at character development</p>
          </div>
        </CardContent>
      </Card>

      {/* Slash Fields Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-gray-800 dark:bg-gray-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Slash Fields
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            these are fields that will be in your Slash vulnerability reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Field */}
          <div className="relative">
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:block hidden">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">this is the story summary</p>
            </div>
          </div>

          {/* Context Field */}
          <div className="relative">
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:block hidden">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Context</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">background information relevant to the narrative</p>
            </div>
          </div>

          {/* Themes Field */}
          <div className="relative">
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:block hidden">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Themes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">exploration of key motifs and messages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Jira Priority Levels Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-blue-500 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Jira Priority Levels
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            these are priority levels available in your Jira project
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldsLoading ? (
            // Loading state for priorities
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative">
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 translate-x-4 lg:block hidden">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : jiraPriorities.length > 0 ? (
            jiraPriorities.map((priority: { id: string; name: string; iconUrl?: string }) => (
              <div key={priority.id} className="relative">
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 translate-x-4 lg:block hidden">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                      {priority.iconUrl ? (
                        <img 
                          src={priority.iconUrl} 
                          alt={priority.name}
                          className="w-6 h-6"
                        />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{priority.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Jira priority level
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {!selectedProject || !selectedIssueType ? 
                  'Please select a project and issue type first to see available priorities.' :
                  'No priorities found for the selected issue type. Please check your project configuration in Jira.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map to Slash Severity Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-gray-800 dark:bg-gray-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Map to Slash Severity
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            map each Jira priority to a corresponding Slash severity level
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldsLoading ? (
            // Loading state for mapping
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : jiraPriorities.length > 0 ? (
            jiraPriorities.map((priority: { id: string; name: string; iconUrl?: string }) => {
              const selectedSeverity = severityMapping[priority.id] || '';
              return (
                <div key={priority.id} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded bg-blue-500 flex items-center justify-center">
                      {priority.iconUrl ? (
                        <img 
                          src={priority.iconUrl} 
                          alt={priority.name}
                          className="w-4 h-4"
                        />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{priority.name}</span>
                  </div>
                  <Select 
                    value={selectedSeverity} 
                    onValueChange={(value) => updateState({ 
                      severityMapping: { ...severityMapping, [priority.id]: value }
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select Slash severity for ${priority.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded bg-red-600 flex items-center justify-center">
                            <AlertOctagon className="h-3 w-3 text-white" />
                          </div>
                          <span>Critical</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="High">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded bg-orange-500 flex items-center justify-center">
                            <AlertTriangle className="h-3 w-3 text-white" />
                          </div>
                          <span>High</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded bg-yellow-500 flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Low">
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
                            <Info className="h-3 w-3 text-white" />
                          </div>
                          <span>Low</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {!selectedProject || !selectedIssueType ? 
                  'Please select a project and issue type first to see available priorities.' :
                  'No priorities found for the selected issue type. Please check your project configuration in Jira.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto mb-8">
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-blue-500 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Jira Fields
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            these are fields that are in your Jira story
          </p>
          
          {/* Map All Required Fields Toggle */}
          <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Label htmlFor="map-all" className="text-sm font-medium text-gray-900 dark:text-white">
                Map All Required Fields
              </Label>
              <Switch
                id="map-all"
                checked={mapAllRequiredFields}
                onCheckedChange={(checked) => updateState({ mapAllRequiredFields: checked })}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {fieldsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : requiredCustomFields.length > 0 ? (
            requiredCustomFields.map((field: JiraField) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-900 dark:text-white">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderFieldInput(field)}
                {field.schema.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type: {field.schema.type}
                    {field.schema.custom && ` (${field.schema.custom})`}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Required Custom Fields
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                This issue type doesn't have any required custom fields to configure.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-purple-500 flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Link Pentests
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Select the pentests you want to link with this Jira integration
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {pentestsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : clientPentests && clientPentests.length > 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pentest-select" className="text-sm font-medium text-gray-900 dark:text-white">
                  Select Pentests <span className="text-red-500">*</span>
                </Label>
                <MultiSelect
                  options={clientPentests.map((pentest: Pentest) => {
                    const pentestName = pentest.title || pentest.name || pentest.pentestName || pentest.projectName || `Pentest ${pentest._id.slice(-6)}`;
                    return {
                      value: pentest._id,
                      label: pentestName
                    };
                  })}
                  selected={selectedPentests || []}
                  onChange={(values) => {
                    updateState({ selectedPentests: values });
                    // Remove auto-sync for deselected pentests
                    const removedPentests = (selectedPentests || []).filter(id => !values.includes(id));
                    if (removedPentests.length > 0) {
                      updateState({
                        autoSyncPentests: (autoSyncPentests || []).filter(id => !removedPentests.includes(id))
                      });
                    }
                  }}
                  placeholder="Select pentests to link"
                  className="w-full"
                />
              </div>

              {/* Auto-sync toggles for selected pentests */}
              {selectedPentests && selectedPentests.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                      Auto-sync Settings
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enable auto-sync to automatically send new vulnerabilities from these pentests to Jira
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedPentests.map((pentestId) => {
                      const isAutoSyncEnabled = (autoSyncPentests || []).includes(pentestId);
                      return (
                        <div key={pentestId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {getPentestName(pentestId)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isAutoSyncEnabled 
                                ? 'Auto-sync enabled - new vulnerabilities will be automatically sent to Jira'
                                : 'Auto-sync disabled - vulnerabilities will need to be sent manually'
                              }
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`auto-sync-${pentestId}`} className="text-xs text-gray-600 dark:text-gray-300">
                              Auto-sync
                            </Label>
                            <Switch
                              id={`auto-sync-${pentestId}`}
                              checked={isAutoSyncEnabled}
                              onCheckedChange={() => toggleAutoSync(pentestId)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {selectedPentests && selectedPentests.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {selectedPentests.length === 1 
                          ? 'Pentest selected successfully!'
                          : `${selectedPentests.length} pentests selected successfully!`
                        }
                      </p>
                      {(autoSyncPentests || []).length > 0 && (
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          Auto-sync enabled for {(autoSyncPentests || []).length} pentest{(autoSyncPentests || []).length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Pentests Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You don't have any pentests available to link. Please create a pentest first.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/pentests')}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
              >
                Go to Pentests
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Continue';
      case 2:
        return 'Continue';
      case 3:
        return 'Continue';
      case 4:
        return 'Continue';
      case 5:
        return saveConfiguration.isPending ? 'Saving...' : 'Complete Setup';
      default:
        return 'Continue';
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return saveConfiguration.isPending || !selectedProject || !selectedIssueType;
    }
    if (currentStep === 3) {
      // Priority mapping is optional - don't block the user
      return false;
    }
    if (currentStep === 4) {
      if (mapAllRequiredFields) {
        return requiredCustomFields.some((field: JiraField) => 
          !customFieldMapping[field.id] || 
          (Array.isArray(customFieldMapping[field.id]) && customFieldMapping[field.id].length === 0)
        );
      }
      return false;
    }
    if (currentStep === 5) {
      return saveConfiguration.isPending || !selectedPentests || selectedPentests.length === 0;
    }
    return false;
  };

  return (
    <JiraSetupLayout currentStep={currentStep} isLoading={isMainLoading}>
      {/* Main Content */}
      {getStepContent()}

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
              disabled={isNextDisabled()}
            >
              {getButtonText()}
            </Button>
          </>
        )}
      </div>
    </JiraSetupLayout>
  );
};

export default JiraSetup; 