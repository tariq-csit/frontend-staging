import { Vulnerability } from "@/types/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/useUser"
import VulnerabilitySeverityBadge from "./VulnerabilitySeverityBadge"
import VulnerabilityStatusBadge from "./VulnerabilityStatusBadge"

function VulnerabilityItemSkeleton() {
  return (
    <div className="border-gray-100 dark:border-gray-700 p-4 grid grid-cols-6 items-center gap-8 border rounded-md min-w-[900px]">
      <div className="flex flex-col gap-1 col-span-2">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-5 w-3/4" />
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-7 w-24 rounded-[8px]" />
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex flex-col gap-1 justify-center items-end">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-9 w-[140px] rounded-md" />
      </div>
    </div>
  )
}

interface StatusOption {
  value: string
  label: string
  color: string
  textColor: string
}

interface VulnerabilitiesListProps {
  vulnerabilities: Vulnerability[]
  pentestId: string
  isLoading?: boolean
  isClientView?: boolean
  onRefetch?: () => void
}

function VulnerabilitiesList({ vulnerabilities, pentestId, isLoading, isClientView = false, onRefetch }: VulnerabilitiesListProps) {
  const { isPentester, isClient, isAdmin, loading } = useUser();
  const containerClasses = "flex flex-col overflow-x-auto justify-between gap-6 w-full font-poppins";
  const listClasses = "flex flex-col gap-4";

  const statusOptions: StatusOption[] = [
    { 
      value: "New", 
      label: "New", 
      color: "bg-[#E5E7EB] dark:bg-[#6B7280]",
      textColor: "text-[#6B7280] dark:text-[#FFFFFF]" 
    },
    { 
      value: "Triaged", 
      label: "Triaged", 
      color: "bg-[#DAE6FD] dark:bg-[#2382F6]",
      textColor: "text-[#2382F6] dark:text-[#FFFFFF]" 
    },
    { 
      value: "Ready For Retest", 
      label: "Ready for Retest", 
      color: "bg-[#FDE68A] dark:bg-[#F59E0B]",
      textColor: "text-[#92400E] dark:text-[#FFFFFF]" 
    },
    { 
      value: "Resolved", 
      label: "Resolved", 
      color: "bg-[#86EFAC] dark:bg-[#166534]",
      textColor: "text-[#166534] dark:text-[#FFFFFF]" 
    },
    { 
      value: "Not Applicable", 
      label: "Not Applicable", 
      color: "bg-[#FCA5A5] dark:bg-[#991B1B]",
      textColor: "text-[#991B1B] dark:text-[#FFFFFF]" 
    },
  ];

  const { mutate: updateVulnerabilityStatus } = useMutation({
    mutationFn: ({ vulnerabilityId, status }: { vulnerabilityId: string; status: string }) => {
      if (isClient()) {
        return axiosInstance.patch(apiRoutes.client.pentests.vulnerabilities.status(pentestId, vulnerabilityId), {
          status: status,
        });
      } else if (isPentester()) {
        return axiosInstance.patch(apiRoutes.pentester.vulnerabilities.updateStatus(pentestId, vulnerabilityId), {
          status: status,
        });
      } else {
        return axiosInstance.patch(apiRoutes.pentests.vulnerabilities.status(pentestId, vulnerabilityId), {
          status: status,
        });
      }
    },
    onSuccess: () => {
      onRefetch?.()
      toast({
        title: "Status updated",
        description: "Vulnerability status has been updated successfully",
      })
    },
  });

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className={listClasses}>
          {[1, 2, 3, 4, 5].map((i) => (
            <VulnerabilityItemSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={containerClasses}>

      <div className={listClasses}>
        {vulnerabilities?.map((vulnerability, i) => (
          <div key={i} className="border-inputBorder dark:bg-gray-900 dark:border-gray-900 p-4 grid grid-cols-6 items-center gap-8 border rounded-md min-w-[900px]">
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-sm text-muted-foreground">Name</span>
              <TooltipProvider>
                <Tooltip>
                    <Link to={`/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerability._id}`}>
                  <TooltipTrigger asChild>
                      <p className="font-medium max-w-full truncate">{vulnerability.title}</p>
                  </TooltipTrigger>
                    </Link>
                  <TooltipContent>
                    <p>{vulnerability.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Priority</span>
              <VulnerabilitySeverityBadge severity={vulnerability.severity} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Reported by</span>
              <p className="font-medium">{vulnerability.reporter.name}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Reported on</span>
              <p className="font-medium">{format(new Date(vulnerability.createdAt), "MMM d, yyyy")}</p>
            </div>

            <div className="flex flex-col gap-1 justify-center items-end">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select
                value={vulnerability.status}
                onValueChange={(value) => {
                  updateVulnerabilityStatus({ vulnerabilityId: vulnerability._id, status: value })
                }}
              >
                <SelectTrigger
                  className={`w-[140px] border ${
                    statusOptions.find((option) => option.value === vulnerability.status)?.color
                  }`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value} 
                      className={`${option.color} ${option.textColor} my-1 rounded-md hover:${option.color} dark:hover:${option.color}`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default VulnerabilitiesList;

