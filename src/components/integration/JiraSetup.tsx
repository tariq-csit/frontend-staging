import React, { useState, useEffect, useRef } from 'react';
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
import { Loader2, Target, Settings, Calendar, Zap, CheckCircle2, Square, ArrowRight, FileText, Shield, AlertTriangle, AlertCircle, AlertOctagon, Info, X, Search } from 'lucide-react';
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
    system?: string;
    custom?: string;
    customId?: number;
    items?: string;
    configuration?: Record<string, boolean>;
  };
}

interface SeverityMapping {
  [key: string]: string;
}

interface CustomFieldMapping {
  [fieldId: string]: {
    type: 'static' | 'vulnerability_mapping';
    value: any;
  };
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

interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  avatarUrl?: string;
}

interface JiraConfigurationResponse {
  isIntegrated: boolean;
  cloudId: string;
  defaultProjectKey: string;
  defaultIssueType: string;
  fieldMappings: {
    severityMapping: {
      [key: string]: string;
    };
    customFields: Array<{
      jiraField: string;
      fieldType: string;
      valueType: string;
      value: any;
    }>;
  };
  pentests: {
    linked: Array<{
      id: string;
      name: string;
      status: string;
      autoSync: boolean;
    }>;
    unlinked: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  };
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
        const parsedState = JSON.parse(saved);
        // Migrate old custom field mapping format to new format if needed
        if (parsedState.customFieldMapping) {
          const migratedMapping: CustomFieldMapping = {};
          Object.entries(parsedState.customFieldMapping).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && 'type' in value && 'value' in value) {
              // Already in new format
              migratedMapping[key] = value;
            } else {
              // Old format - migrate to new format with static type
              migratedMapping[key] = {
                type: 'static',
                value: value
              };
            }
          });
          parsedState.customFieldMapping = migratedMapping;
        }
        return parsedState;
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
  const [previousProject, setPreviousProject] = useState<string>(loadSavedState().selectedProject);

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
  const editMode = location.state?.editMode;

  // Fetch client organization information
  const { data: clientOrganization, isLoading: organizationLoading } = useQuery({
    queryKey: ['client-organization'],
    queryFn: () => axiosInstance.get(apiRoutes.client.organization).then((res) => res.data as Client),
    enabled: isClient() && !userLoading, // Wait for user to load
  });

  // Calculate unified loading state
  const isMainLoading = userLoading || (isClient() && organizationLoading);

  // If we just connected but the integration status hasn't updated yet, proceed anyway
  const isIntegratedOrJustConnected = clientOrganization?.integrations?.jira || justConnected;

  // Fetch current configuration if in edit mode
  const { data: currentConfig, isLoading: configLoading } = useQuery({
    queryKey: ['jira-configuration'],
    queryFn: () => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      return axiosInstance.get(apiRoutes.client.integrations.jira.getConfiguration(clientId)).then((res) => res.data as JiraConfigurationResponse);
    },
    enabled: !!clientOrganization?._id && editMode && isIntegratedOrJustConnected,
  });

  // Update main loading state to include config loading
  const isMainLoadingWithConfig = isMainLoading || (editMode && configLoading);

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

  // Extract and filter fields - custom fields with exclusions
  const customFields = React.useMemo(() => {
    if (!jiraFieldsResponse?.fields) return [];
    
    return jiraFieldsResponse.fields.filter((field: JiraField) => {
      // Must be a custom field
      if (!field.id.startsWith('customfield_')) return false;
      
      // Exclude development integration plugin fields
      if (field.schema.custom?.includes('com.atlassian.jira.plugins.jira-development-integration-plugin')) {
        return false;
      }
      
      // Exclude specific field names
      if (['Flagged', 'Team', 'Rank'].includes(field.name)) {
        return false;
      }
      
      return true;
    });
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

  // Combine pentests data in edit mode
  const allAvailablePentests = React.useMemo(() => {
    if (editMode && currentConfig && !configLoading) {
      // In edit mode, combine linked and unlinked pentests from config
      const linkedPentests = currentConfig.pentests.linked.map(p => ({
        _id: p.id,
        title: p.name,
        name: p.name,
        status: p.status,
        createdAt: new Date().toISOString()
      }));
      
      const unlinkedPentests = currentConfig.pentests.unlinked.map(p => ({
        _id: p.id,
        title: p.name,
        name: p.name,
        status: p.status,
        createdAt: new Date().toISOString()
      }));
      
      return [...linkedPentests, ...unlinkedPentests];
    }
    
    // In normal mode, use the regular pentests query
    return clientPentests || [];
  }, [editMode, currentConfig, configLoading, clientPentests]);

  // Mutation to unlink a pentest from Jira integration
  const unlinkPentest = useMutation({
    mutationFn: async (pentestId: string) => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      
      return axiosInstance.delete(apiRoutes.client.integrations.jira.unlink(clientId, pentestId));
    },
    onSuccess: (_, pentestId) => {
      toast({
        title: "Pentest Unlinked",
        description: "Pentest has been successfully unlinked from Jira integration.",
      });
      
      // Remove from selected pentests and auto-sync pentests
      updateState({
        selectedPentests: selectedPentests.filter(id => id !== pentestId),
        autoSyncPentests: (autoSyncPentests || []).filter(id => id !== pentestId)
      });
      
      // Refresh the configuration data
      if (editMode && clientOrganization?._id) {
        // This will trigger a refetch of the current config
        window.location.reload();
      }
    },
    onError: (error) => {
      console.error('Error unlinking pentest:', error);
      toast({
        title: "Unlink Failed",
        description: "Failed to unlink pentest from Jira integration. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveConfiguration = useMutation({
    mutationFn: async (config: { 
      projectKey: string; 
      issueType: string; 
      severityMapping: SeverityMapping; 
      customFields: CustomFieldMapping; 
      selectedPentests: string[];
      autoSyncPentests: string[];
    }) => {
      const clientId = clientOrganization?._id;
      if (!clientId) throw new Error('Client ID not found');
      
      // Clean severity mapping - handle multiple Jira priorities mapping to same Slash severity
      const cleanSeverityMapping: { [key: string]: string } = {};
      Object.entries(config.severityMapping).forEach(([slashSeverity, jiraPriorityId]) => {
        if (slashSeverity && jiraPriorityId && ['Critical', 'High', 'Medium', 'Low'].includes(slashSeverity)) {
          cleanSeverityMapping[slashSeverity] = jiraPriorityId;
        }
      });
      
      // Transform custom field mapping into the expected API format
      const customFieldsArray = Object.entries(config.customFields)
        .filter(([, mapping]) => mapping.value !== undefined && mapping.value !== null && mapping.value !== '')
        .map(([fieldId, mapping]) => {
          // Find the field info to determine field type
          const field = customFields.find((f: JiraField) => f.id === fieldId);
          let fieldType = 'text'; // default
          let valueType = 'static'; // default
          let processedValue = mapping.value;
          
          if (field) {
            if (field.schema.custom?.includes('textarea')) {
              fieldType = 'textarea';
            } else if ((field.schema.type === 'array' && field.schema.items === 'string' && field.id === 'labels') || 
                       (field.schema.type === 'array' && field.schema.items === 'string' && field.schema.custom?.includes('labels'))) {
              fieldType = 'labels';
            } else if (field.schema.type === 'option') {
              // Check if it's radio buttons or select dropdown
              if (field.schema.custom?.includes('radiobuttons')) {
                fieldType = 'radio';
              } else {
                fieldType = 'select';
              }
            } else if (field.schema.type === 'array') {
              fieldType = 'multiselect';
            } else if (field.schema.type === 'user') {
              fieldType = 'user';
            } else if (field.schema.type === 'date') {
              fieldType = 'date';
            } else if (field.schema.type === 'datetime') {
              fieldType = 'datetime';
            } else if (field.schema.type === 'number') {
              fieldType = 'number';
            }
          }
          
          // Handle different mapping types
          if (mapping.type === 'vulnerability_mapping') {
            valueType = 'template';
            processedValue = `\${vulnerability.${mapping.value}}`;
          } else if (mapping.type === 'static') {
            valueType = 'static';
            // Handle user fields - extract account IDs if it's a JiraUser array
            if (fieldType === 'user' && Array.isArray(mapping.value)) {
              if (mapping.value.length > 0 && typeof mapping.value[0] === 'object' && 'accountId' in mapping.value[0]) {
                // It's an array of JiraUser objects, extract accountIds
                processedValue = mapping.value.map((user: JiraUser) => user.accountId);
              }
              // If it's a single user field, use just the first user's accountId
              if (fieldType === 'user' && processedValue.length === 1) {
                processedValue = processedValue[0];
              }
            } else if (fieldType === 'number') {
              processedValue = Number(mapping.value);
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
        customFields: customFieldsArray
      };

      console.log('Sending Jira configuration:', requestBody);
      
      // Step 1: Save the main configuration
      const configResponse = await axiosInstance.post(apiRoutes.client.integrations.jira.configure(clientId), requestBody);
      
      // Step 2: Enable Jira integration for selected pentests
      if (config.selectedPentests.length > 0) {
        console.log('Enabling Jira integration for pentests:', config.selectedPentests);
        
        const enablePromises = config.selectedPentests.map(pentestId => 
          axiosInstance.post(apiRoutes.client.pentests.jira.enable(clientId, pentestId))
            .then(response => ({ success: true, pentestId, response }))
            .catch(error => {
              console.error(`Failed to enable Jira integration for pentest ${pentestId}:`, error);
              return { success: false, pentestId, error: error.message };
            })
        );
        
        const enableResults = await Promise.all(enablePromises);
        const failedEnable = enableResults.filter(result => !result.success);
        
        if (failedEnable.length > 0) {
          console.warn('Some pentest enable requests failed:', failedEnable);
        }
      }
      
      // Step 3: Handle auto-sync settings for all selected pentests
      if (config.selectedPentests.length > 0) {
        console.log('Configuring auto-sync for pentests:', {
          enabled: config.autoSyncPentests,
          disabled: config.selectedPentests.filter(id => !config.autoSyncPentests.includes(id))
        });
        
        const autoSyncPromises = config.selectedPentests.map(pentestId => {
          const shouldEnable = config.autoSyncPentests.includes(pentestId);
          return axiosInstance.post(apiRoutes.client.integrations.jira.autoSync(clientId, pentestId), {
            enabled: shouldEnable
          })
            .then(response => ({ success: true, pentestId, enabled: shouldEnable, response }))
            .catch(error => {
              console.error(`Failed to ${shouldEnable ? 'enable' : 'disable'} auto-sync for pentest ${pentestId}:`, error);
              return { success: false, pentestId, enabled: shouldEnable, error: error.message };
            });
        });
        
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
        title: "Configuration Completed",
        description: (autoSyncPentests || []).length > 0 
          ? `Jira integration configured successfully for ${selectedPentests.length} pentest${selectedPentests.length !== 1 ? 's' : ''} with auto-sync enabled for ${(autoSyncPentests || []).length}.`
          : `Jira integration configured successfully for ${selectedPentests.length} pentest${selectedPentests.length !== 1 ? 's' : ''}.`,
      });
      navigate('/integrations');
    },
    onError: (error) => {
      console.error('Error configuring Jira integration:', error);
      toast({
        title: "Configuration Failed",
        description: "Failed to configure Jira integration. Please try again.",
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

  // Helper function to get available vulnerability model fields for mapping
  const getVulnerabilityMappingOptions = () => [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'severity', label: 'Severity' },
    { value: 'status', label: 'Status' },
    { value: 'cvss', label: 'CVSS Score' },
    { value: 'cvssVector', label: 'CVSS Vector' },
    { value: 'affected_host', label: 'Affected Host' },
    { value: 'likelihood', label: 'Likelihood' },
    { value: 'recommended_solution', label: 'Recommended Solution' },
    { value: 'steps_to_reproduce', label: 'Steps to Reproduce' },
    { value: 'impact', label: 'Impact' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  // Helper function to render field input based on type
  const renderFieldInput = (field: JiraField) => {
    const fieldMapping = customFieldMapping[field.id] || { type: 'static', value: '' };
    const isTextOrTextarea = field.schema.type === 'string' && (
      !field.schema.custom || 
      field.schema.custom.includes('textfield') || 
      field.schema.custom.includes('textarea')
    );

    // For text and textarea fields, show mapping options
    if (isTextOrTextarea) {
      return (
        <div className="space-y-4">
          {/* Mapping Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mapping Type
            </Label>
            <RadioGroup
              value={fieldMapping.type}
              onValueChange={(value: 'static' | 'vulnerability_mapping') => {
                updateState({ 
                  customFieldMapping: { 
                    ...customFieldMapping, 
                    [field.id]: { 
                      type: value, 
                      value: value === 'static' ? '' : 'title' // Default to title for vulnerability mapping
                    }
                  }
                });
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="static" id={`${field.id}-static`} />
                <Label htmlFor={`${field.id}-static`} className="text-sm">Static Value</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vulnerability_mapping" id={`${field.id}-mapping`} />
                <Label htmlFor={`${field.id}-mapping`} className="text-sm">Map to Vulnerability Model</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input based on mapping type */}
          {fieldMapping.type === 'static' ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Static Value
              </Label>
              {field.schema.custom?.includes('textarea') ? (
                <Textarea
                  placeholder={`Enter static value for ${field.name.toLowerCase()}`}
                  value={fieldMapping.value || ''}
                  onChange={(e) => updateState({ 
                    customFieldMapping: { 
                      ...customFieldMapping, 
                      [field.id]: { 
                        type: 'static', 
                        value: e.target.value 
                      }
                    }
                  })}
                  className="w-full"
                  rows={4}
                />
              ) : (
                <Input
                  placeholder={`Enter static value for ${field.name.toLowerCase()}`}
                  value={fieldMapping.value || ''}
                  onChange={(e) => updateState({ 
                    customFieldMapping: { 
                      ...customFieldMapping, 
                      [field.id]: { 
                        type: 'static', 
                        value: e.target.value 
                      }
                    }
                  })}
                  className="w-full"
                />
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vulnerability Field
              </Label>
              <Select
                value={fieldMapping.value || 'title'}
                onValueChange={(value) => updateState({ 
                  customFieldMapping: { 
                    ...customFieldMapping, 
                    [field.id]: { 
                      type: 'vulnerability_mapping', 
                      value: value 
                    }
                  }
                })}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Select vulnerability field to map" />
                </SelectTrigger>
                <SelectContent>
                  {getVulnerabilityMappingOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This field will automatically be populated with the selected vulnerability data
              </p>
            </div>
          )}
        </div>
      );
    }

    // For non-text fields, keep the original logic
    const fieldValue = fieldMapping.value;

    switch (field.schema.type) {
      case 'option':
        if (field.schema.custom?.includes('radiobuttons')) {
          return (
            <RadioGroup
              value={fieldValue || ''}
              onValueChange={(value) => updateState({ 
                customFieldMapping: { 
                  ...customFieldMapping, 
                  [field.id]: { type: 'static', value: value }
                }
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
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: value }
              }
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
                    checked={Array.isArray(fieldValue) ? fieldValue.includes(option.id) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (checked) {
                        updateState({ 
                          customFieldMapping: { 
                            ...customFieldMapping, 
                            [field.id]: { 
                              type: 'static', 
                              value: [...currentValues, option.id] 
                            }
                          }
                        });
                      } else {
                        updateState({ 
                          customFieldMapping: { 
                            ...customFieldMapping, 
                            [field.id]: { 
                              type: 'static', 
                              value: currentValues.filter((val: string) => val !== option.id) 
                            }
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
        // Array of strings (labels) - use the enhanced labels component
        return (
          <LabelsWithVulnerabilityMapping
            value={Array.isArray(fieldValue) ? fieldValue : []}
            onChange={(values) => updateState({ 
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: values }
              }
            })}
            fieldName={field.name}
          />
        );
      
      case 'labels': // Handle native Jira "labels" field type
        // Array of strings (labels/tags) with vulnerability model support
        return (
          <LabelsWithVulnerabilityMapping
            value={Array.isArray(fieldValue) ? fieldValue : []}
            onChange={(values) => updateState({ 
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: values }
              }
            })}
            fieldName={field.name}
          />
        );

      case 'user':
        return (
          <UserSearch
            value={Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'object' 
              ? fieldValue 
              : (Array.isArray(fieldValue) 
                ? fieldValue.map(id => ({ accountId: id, displayName: `User ${id.slice(-6)}`, emailAddress: undefined, avatarUrl: undefined }))
                : fieldValue ? [{ accountId: fieldValue, displayName: `User ${fieldValue.slice(-6)}`, emailAddress: undefined, avatarUrl: undefined }] : [])}
            onChange={(users) => updateState({ 
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: users }
              }
            })}
            placeholder="Search and select users"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => updateState({ 
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: e.target.value }
              }
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
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: e.target.value }
              }
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
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: e.target.value }
              }
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
              customFieldMapping: { 
                ...customFieldMapping, 
                [field.id]: { type: 'static', value: e.target.value }
              }
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
        const unfilledRequiredFields = customFields.filter((field: JiraField) => {
          const mapping = customFieldMapping[field.id];
          return !mapping || 
                 !mapping.value || 
                 (Array.isArray(mapping.value) && mapping.value.length === 0);
        });
        
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
        autoSyncPentests: autoSyncPentests || []
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Clear saved state when going back to integrations
      localStorage.removeItem(STORAGE_KEY);
      navigate('/integrations');
    } else {
      updateState({ currentStep: currentStep - 1 });
    }
  };

  // Clear issue type only when project actually changes to a different value
  React.useEffect(() => {
    if (selectedProject && previousProject && selectedProject !== previousProject) {
      updateState({ selectedIssueType: '' });
    }
    setPreviousProject(selectedProject);
  }, [selectedProject, previousProject]);

  // LabelsWithVulnerabilityMapping component for labels fields with vulnerability model support
  const LabelsWithVulnerabilityMapping: React.FC<{
    value: string[];
    onChange: (values: string[]) => void;
    fieldName: string;
  }> = ({ value, onChange, fieldName }) => {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const vulnerabilityFields = [
      { value: 'title', label: 'Title' },
      { value: 'severity', label: 'Severity' },
      { value: 'affected_host', label: 'Affected Host' },
      { value: 'cvss', label: 'CVSS Score' },
      { value: 'reporter', label: 'Reporter' }
    ];

    // Check if cursor is after "{{vulnerability." pattern
    const shouldShowDropdown = () => {
      const beforeCursor = inputValue.substring(0, cursorPosition);
      const match = beforeCursor.match(/\{\{vulnerability\.([^}]*)$/);
      return !!match;
    };

    // Get the current search term for filtering
    const getCurrentSearchTerm = () => {
      const beforeCursor = inputValue.substring(0, cursorPosition);
      const match = beforeCursor.match(/\{\{vulnerability\.([^}]*)$/);
      return match ? match[1] : '';
    };

    // Filter vulnerability fields based on search term
    const filteredFields = vulnerabilityFields.filter(field =>
      field.label.toLowerCase().includes(getCurrentSearchTerm().toLowerCase()) ||
      field.value.toLowerCase().includes(getCurrentSearchTerm().toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const newCursorPos = e.target.selectionStart || 0;
      
      setInputValue(newValue);
      setCursorPosition(newCursorPos);
      
      // Show dropdown if typing vulnerability template and cursor is in the right position
      const beforeCursor = newValue.substring(0, newCursorPos);
      const hasTemplate = beforeCursor.includes('{{vulnerability.');
      const isInTemplate = beforeCursor.match(/\{\{vulnerability\.([^}]*)$/);
      
      setShowDropdown(hasTemplate && !!isInTemplate);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCursorPosition(e.currentTarget.selectionStart || 0);
      
      if (e.key === 'Enter') {
        e.preventDefault();
        addLabel();
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const newCursorPos = e.currentTarget.selectionStart || 0;
      setCursorPosition(newCursorPos);
      
      // Check if dropdown should be shown at the new cursor position
      const beforeCursor = inputValue.substring(0, newCursorPos);
      const hasTemplate = beforeCursor.includes('{{vulnerability.');
      const isInTemplate = beforeCursor.match(/\{\{vulnerability\.([^}]*)$/);
      
      setShowDropdown(hasTemplate && !!isInTemplate);
    };

    const insertVulnerabilityField = (fieldValue: string) => {
      const beforeCursor = inputValue.substring(0, cursorPosition);
      const afterCursor = inputValue.substring(cursorPosition);
      
      // Find the last occurrence of {{vulnerability. pattern
      const lastTemplateIndex = beforeCursor.lastIndexOf('{{vulnerability.');
      if (lastTemplateIndex !== -1) {
        // Replace from the template start to cursor position with the complete template
        const beforeTemplate = beforeCursor.substring(0, lastTemplateIndex);
        const completeTemplate = `{{vulnerability.${fieldValue}}}`;
        const newValue = beforeTemplate + completeTemplate + afterCursor;
        
        setInputValue(newValue);
        setShowDropdown(false);
        
        // Focus back to input and set cursor after the inserted template
        setTimeout(() => {
          if (inputRef.current) {
            const newCursorPos = beforeTemplate.length + completeTemplate.length;
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            setCursorPosition(newCursorPos);
          }
        }, 10);
      }
    };

    const addLabel = () => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        onChange([...value, trimmedValue]);
        setInputValue('');
        setShowDropdown(false);
      }
    };

    const removeLabel = (labelToRemove: string) => {
      onChange(value.filter(label => label !== labelToRemove));
    };

    const isVulnerabilityTemplate = (label: string) => {
      return label.includes('{{vulnerability.');
    };

    const formatLabelDisplay = (label: string) => {
      if (isVulnerabilityTemplate(label)) {
        return label; // Show the full template
      }
      return label;
    };

    const getLabelColor = (label: string) => {
      if (isVulnerabilityTemplate(label)) {
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      }
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    };

    return (
      <div className="space-y-3">
        {/* Display current labels */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((label, index) => (
              <div 
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getLabelColor(label)}`}
              >
                <span className="font-mono text-xs">{formatLabelDisplay(label)}</span>
                <button
                  type="button"
                  onClick={() => removeLabel(label)}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new label input with autocomplete */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
                             <Input
                 ref={inputRef}
                 value={inputValue}
                 onChange={handleInputChange}
                 onKeyDown={handleKeyDown}
                 onClick={handleInputClick}
                 placeholder={`Enter ${fieldName.toLowerCase()} (use {{vulnerability.fieldName}} for dynamic values)`}
                 className="w-full"
               />
              
              {/* Vulnerability field dropdown */}
              {showDropdown && filteredFields.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredFields.map((field) => (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => insertVulnerabilityField(field.value)}
                      className="w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <div className="flex-1 flex flex-row gap-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500 bg-primary/30 flex items-center justify-center rounded-lg px-2 py-1 dark:text-gray-400 font-mono">
                          {`{{vulnerability.${field.value}}}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              type="button"
              onClick={addLabel}
              size="sm"
              variant="outline"
              className="shrink-0"
              disabled={!inputValue.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        
                 {/* Help text */}
         <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
           <p>• Type static values or use dynamic templates like <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{vulnerability.title}}'}</code></p>
           <p>• Start typing <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{vulnerability.'}</code> to see available fields</p>
         </div>
        
        {/* Empty state message */}
        {value.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No labels added yet. Enter a value above and click "Add".
          </p>
        )}
      </div>
    );
  };

  // UserSearch component for user picker fields
  const UserSearch: React.FC<{
    value: JiraUser[];
    onChange: (users: JiraUser[]) => void;
    placeholder?: string;
  }> = ({ value, onChange, placeholder = "Search and select users" }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Search users query
    const { data: searchResults, isLoading: isSearching, error: searchError } = useQuery({
      queryKey: ['jira-users-search', searchTerm],
      queryFn: async () => {
        const clientId = clientOrganization?._id;
        if (!clientId || !searchTerm || searchTerm.length < 2) return [];
        
        try {
          const response = await axiosInstance.get(apiRoutes.client.integrations.jira.searchUsers(clientId), {
            params: { query: searchTerm }
          });
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error('Error searching Jira users:', error);
          throw error;
        }
      },
      enabled: !!clientOrganization?._id && !!searchTerm && searchTerm.length >= 2,
      retry: 1,
      staleTime: 1000 * 30, // Cache results for 30 seconds
    });

    const users = searchResults || [];

    const handleUserSelect = (user: JiraUser) => {
      if (!value.find(u => u.accountId === user.accountId)) {
        // Add complete user object to the array
        onChange([...value, user]);
      }
      setSearchTerm('');
      setIsOpen(false);
    };

    const handleUserRemove = (accountId: string) => {
      // Remove user from the array
      onChange(value.filter(user => user.accountId !== accountId));
    };

    // Get current selected users (use the value directly since it now contains full user objects)
    const currentSelectedUsers = value || [];

    return (
      <div className="space-y-2">
        {/* Selected Users */}
        {currentSelectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentSelectedUsers.map((user: JiraUser) => (
              <div
                key={user.accountId}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
              >
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{user.displayName}</span>
                <button
                  type="button"
                  onClick={() => handleUserRemove(user.accountId)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(e.target.value.length >= 2);
              }}
              onFocus={() => setIsOpen(searchTerm.length >= 2)}
              className="pl-9"
            />
          </div>

          {/* Search Results Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-3 text-center">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Searching users...</span>
                </div>
              ) : searchError ? (
                <div className="p-3 text-center text-red-600 dark:text-red-400">
                  <span className="text-sm">Error searching users. Please try again.</span>
                </div>
              ) : users.length > 0 ? (
                users.map((user: JiraUser) => (
                  <button
                    key={user.accountId}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    disabled={value.some(u => u.accountId === user.accountId)}
                    className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors ${
                      value.some(u => u.accountId === user.accountId) ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    {user.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {user.displayName}
                      </div>
                      {user.emailAddress && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.emailAddress}
                        </div>
                      )}
                    </div>
                    {value.some(u => u.accountId === user.accountId) && (
                      <span className="ml-2 text-green-600 dark:text-green-400 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                ))
              ) : searchTerm.length >= 2 ? (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  <span className="text-sm">No users found for "{searchTerm}"</span>
                </div>
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  <span className="text-sm">Type at least 2 characters to search</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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

  // Pre-populate state from current configuration when in edit mode
  useEffect(() => {
    if (editMode && currentConfig && !configLoading) {
      console.log('Pre-populating state from current config:', currentConfig);
      
      // Convert custom fields back to our internal format
      const customFieldMapping: CustomFieldMapping = {};
      currentConfig.fieldMappings.customFields.forEach(field => {
        customFieldMapping[field.jiraField] = {
          type: field.valueType === 'template' ? 'vulnerability_mapping' : 'static',
          value: field.valueType === 'template' 
            ? field.value.replace('${vulnerability.', '').replace('}', '') // Extract field name from template
            : field.value
        };
      });

      // Get linked pentest IDs and auto-sync pentest IDs
      const linkedPentestIds = currentConfig.pentests.linked.map(p => p.id);
      const autoSyncPentestIds = currentConfig.pentests.linked.filter(p => p.autoSync).map(p => p.id);

      updateState({
        selectedProject: currentConfig.defaultProjectKey,
        selectedIssueType: currentConfig.defaultIssueType,
        severityMapping: currentConfig.fieldMappings.severityMapping,
        customFieldMapping: customFieldMapping,
        selectedPentests: linkedPentestIds,
        autoSyncPentests: autoSyncPentestIds,
        // Don't change currentStep - let user navigate through wizard
      });
      
      // Also set the previous project to prevent clearing
      setPreviousProject(currentConfig.defaultProjectKey);
    }
  }, [editMode, currentConfig, configLoading]);

  if (isMainLoadingWithConfig && fromCallback) {
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

  if (!isMainLoadingWithConfig && !isIntegratedOrJustConnected) {
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
      {isMainLoadingWithConfig ? (
        <>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
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
                <Skeleton className="h-16 w-16 rounded-lg" />
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
                <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <img 
                    src="/Jira Icon.svg" 
                    alt="Jira" 
                    className="h-10 w-10"
                  />
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
                <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <img 
                    src="/Jira Icon.svg" 
                    alt="Jira" 
                    className="h-10 w-10"
                  />
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
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Jira Fields Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <img 
                src="/Jira Icon.svg" 
                alt="Jira" 
                className="h-10 w-10"
              />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Jira Fields
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            These are fields that are in your Jira story
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Field */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">This is the story summary</p>
          </div>

          {/* Description Field */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">This is the description of the vulnerability</p>
          </div>

        </CardContent>
      </Card>

      {/* Slash Fields Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center">
            <img 
              src="/logo-small.png" 
              alt="Slash" 
              className="w-24 object-contain"
            />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Slash Fields
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            These are fields that will be in your Slash vulnerability reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Field */}
          <div className="relative">
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:block hidden">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Title</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">This is the title of the vulnerability</p>
            </div>
          </div>

          {/* Context Field */}
          <div className="relative">
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:block hidden">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">This is the description of the vulnerability</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
    <p className="text-sm text-gray-500 text-center dark:text-gray-400 my-2">These fields are automatically mapped with Jira</p>
    </>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Slash Severity Levels Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-small.png" 
              alt="Slash" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Slash Severity Levels
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            These are severity levels in your Slash vulnerability reports
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Severity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center">
                <AlertOctagon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Critical</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Highest severity vulnerabilities
                </p>
              </div>
            </div>
          </div>

          {/* High Severity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-orange-500 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">High</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  High priority vulnerabilities
                </p>
              </div>
            </div>
          </div>

          {/* Medium Severity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-yellow-500 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Medium</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Medium priority vulnerabilities
                </p>
              </div>
            </div>
          </div>

          {/* Low Severity */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Low</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Low priority vulnerabilities
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map to Jira Priorities Card */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <img 
                src="/Jira Icon.svg" 
                alt="Jira" 
                className="h-10 w-10"
              />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Map to Jira Priorities
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Map each Slash severity to a corresponding Jira priority level
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
            ['Critical', 'High', 'Medium', 'Low'].map((slashSeverity) => {
              const selectedJiraPriority = severityMapping[slashSeverity] || '';
              const severityConfig = {
                'Critical': { icon: AlertOctagon, color: 'bg-red-600' },
                'High': { icon: AlertTriangle, color: 'bg-orange-500' },
                'Medium': { icon: AlertCircle, color: 'bg-yellow-500' },
                'Low': { icon: Info, color: 'bg-blue-500' }
              };
              const { icon: SeverityIcon, color } = severityConfig[slashSeverity as keyof typeof severityConfig];
              
              return (
                <div key={slashSeverity} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className={`h-6 w-6 rounded ${color} flex items-center justify-center`}>
                      <SeverityIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{slashSeverity}</span>
                  </div>
                  <Select 
                    value={selectedJiraPriority} 
                    onValueChange={(value) => updateState({ 
                      severityMapping: { ...severityMapping, [slashSeverity]: value }
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select Jira priority for ${slashSeverity}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {jiraPriorities.map((priority: { id: string; name: string; iconUrl?: string }) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          <div className="flex items-center space-x-2">
                            {priority.iconUrl ? (
                              <img 
                                src={priority.iconUrl} 
                                alt={priority.name}
                                className="w-4 h-4"
                              />
                            ) : (
                              <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
                                <AlertTriangle className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <span>{priority.name}</span>
                          </div>
                        </SelectItem>
                      ))}
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
            <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <img 
                src="/Jira Icon.svg" 
                alt="Jira" 
                className="h-10 w-10"
              />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Custom Field Mapping
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Configure how vulnerability data maps to your Jira custom fields
          </p>
          
        </CardHeader>
      </Card>
      
      {fieldsLoading ? (
        <div className="space-y-6 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customFields.length > 0 ? (
        <div className="space-y-6 mt-6">
          {customFields.map((field: JiraField, index: number) => (
            <Card key={field.id} className="border-0 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Field Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {field.schema.custom && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {field.schema.custom.split(':').pop()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Field Configuration */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    {renderFieldInput(field)}
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 mt-6">
          <CardContent className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No Required Custom Fields
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              This issue type doesn't have any required custom fields to configure. You can proceed to the next step.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-2xl mx-auto mb-8">
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-small.png" 
              alt="Slash" 
              className="w-24 object-contain"
            />
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
                          <div className="flex items-center space-x-3">
                            {editMode && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unlinkPentest.mutate(pentestId)}
                                disabled={unlinkPentest.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                              >
                                {unlinkPentest.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                <span className="ml-1">Unlink</span>
                              </Button>
                            )}
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
        return saveConfiguration.isPending ? 'Configuring Integration...' : 'Complete Setup';
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
        const unfilledRequiredFields = customFields.filter((field: JiraField) => {
          const mapping = customFieldMapping[field.id];
          return !mapping || 
                 !mapping.value || 
                 (Array.isArray(mapping.value) && mapping.value.length === 0);
        });
        
        return unfilledRequiredFields.length > 0;
      }
      return false;
    }
    if (currentStep === 5) {
      return saveConfiguration.isPending || !selectedPentests || selectedPentests.length === 0;
    }
    return false;
  };

  return (
    <JiraSetupLayout currentStep={currentStep} isLoading={isMainLoadingWithConfig}>
      {/* Main Content */}
      {getStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {isMainLoadingWithConfig ? (
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