import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, FileText, Settings, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

interface JiraSetupLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  isLoading?: boolean;
}

const JiraSetupLayout: React.FC<JiraSetupLayoutProps> = ({ children, currentStep, isLoading = false }) => {
  const steps = [
    {
      number: 1,
      title: "Connect Jira",
      status: currentStep === 1 ? "in-progress" : currentStep > 1 ? "complete" : "incomplete",
      icon: Link,
    },
    {
      number: 2,
      title: "General Field Mapping",
      status: currentStep === 2 ? "in-progress" : currentStep > 2 ? "complete" : "incomplete",
      icon: FileText,
    },
    {
      number: 3,
      title: "Severity Mapping",
      status: currentStep === 3 ? "in-progress" : currentStep > 3 ? "complete" : "incomplete",
      icon: AlertTriangle,
    },
    {
      number: 4,
      title: "Custom Field Mapping",
      status: currentStep === 4 ? "in-progress" : currentStep > 4 ? "complete" : "incomplete",
      icon: Settings,
    },
    {
      number: 5,
      title: "Link Pentest",
      status: currentStep === 5 ? "in-progress" : currentStep > 5 ? "complete" : "incomplete",
      icon: Target,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500 text-white";
      case "in-progress":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500";
    }
  };

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "in-progress":
        return "In Progress";
      default:
        return "Incomplete";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700 z-0" style={{ 
              left: '3rem', 
              right: '3rem' 
            }} />
            
            {isLoading ? (
              // Skeleton loading state for steps
              <div className="flex justify-between w-full relative z-10">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-4">
                    <Skeleton className="h-12 w-12 rounded-full mb-2" />
                    <div className="text-center space-y-2">
                      <Skeleton className="h-3 w-12 mx-auto" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between w-full relative z-10">
                {steps.map((step) => {
                  const Icon = step.status === "complete" ? CheckCircle2 : step.icon;
                  return (
                    <div key={step.number} className="flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full mb-2 ${getStatusColor(step.status)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          STEP {step.number}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</div>
                        <Badge
                          variant="secondary"
                          className={`mt-1 text-xs ${getBadgeStyles(step.status)}`}
                        >
                          {getBadgeText(step.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default JiraSetupLayout; 