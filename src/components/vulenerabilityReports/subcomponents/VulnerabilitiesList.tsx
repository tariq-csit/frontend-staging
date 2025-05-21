import { Vulnerability } from "@/types/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import VulnerabilitySeverityBadge from "./VulnerabilitySeverityBadge"
import VulnerabilityStatusBadge from "./VulnerabilityStatusBadge"
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

function VulnerabilityItemSkeleton() {
  return (
    <div className="border-gray-100 p-4 grid grid-cols-9 items-center gap-8 border rounded-md min-w-[1000px]">
      <div className="flex flex-col gap-1 col-span-4">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-5 w-3/4" />
      </div>

      <div className="grid grid-cols-2 gap-4 col-span-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-7 w-24 rounded-[8px]" />
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-7 w-24 rounded-[8px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 col-span-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="col-span-1 flex justify-end items-center">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  )
}

interface VulnerabilitiesListProps {
  vulnerabilities: Vulnerability[]
  pentestId: string
  isLoading?: boolean
  isClientView?: boolean
}

function VulnerabilitiesList({ vulnerabilities, pentestId, isLoading, isClientView = false }: VulnerabilitiesListProps) {
  const containerClasses = "flex flex-col overflow-x-auto justify-between gap-6 w-full font-poppins";
  const listClasses = "flex flex-col gap-4";

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
      {!isClientView && (
        <div className="flex justify-end mb-4">
          <Link to={`/vulnerability-reports/${pentestId}/vulnerabilities/add`}>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add New Vulnerability
            </Button>
          </Link>
        </div>
      )}

      <div className={listClasses}>
        {vulnerabilities?.map((vulnerability, i) => (
          <div key={i} className="border-inputBorder p-4 grid grid-cols-9 items-center gap-8 border rounded-md min-w-[1000px]">
            <div className="flex flex-col gap-1 col-span-3">
              <span className="text-sm text-muted-foreground">Name</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium max-w-full truncate">{vulnerability.title}</p>
                  </TooltipTrigger>
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

              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <VulnerabilityStatusBadge status={vulnerability.status} />
              </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Reported by</span>
              <p className="font-medium">{vulnerability.reporter.name}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Reported on</span>
              <p className="font-medium">{format(new Date(vulnerability.createdAt), "MMM d, yyyy")}</p>
            </div>

            <div className="col-span-1 flex justify-end items-center">
              <Link className="text-primary-900 text-sm" to={`/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerability._id}`}>View details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VulnerabilitiesList;
