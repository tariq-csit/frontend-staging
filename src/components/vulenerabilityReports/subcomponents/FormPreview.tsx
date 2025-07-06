"use client"

import { Button } from "@/components/ui/button"
import FileAttachmentPreview from "./FileAttachmentsPreview"
import CommentSection from "./CommentSection"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { Attachment, Pentest, User, Vulnerability } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Edit, Loader2, Lock, Trash2, SendHorizontal } from "lucide-react"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import CommentCard from "./CommentCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/contexts/SidebarContext"
import VulnerabilitySeverityBadge from "./VulnerabilitySeverityBadge"
import VulnerabilityStatusBadge from "./VulnerabilityStatusBadge"
import { useUser } from "@/hooks/useUser"

interface StatusOption {
  value: string
  label: string
  color: string
  textColor: string
}

function VulnerabilityView() {
  const { pentestId, vulnerabilityId } = useParams<{ pentestId: string; vulnerabilityId: string }>()
  const navigate = useNavigate()
  const { isPentester, isClient, isAdmin, loading, user } = useUser();

  const { data: vulnerability, refetch: refetchVulnerability, isLoading: isLoadingVulnerability } = useQuery({
    queryKey: ["pentest", pentestId, "vulnerability", vulnerabilityId],
    queryFn: () => {
      if (isClient()) {
        return axiosInstance
          .get<Vulnerability>(apiRoutes.client.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!))
          .then((res) => res.data);
      } else if (isPentester()) {
        return axiosInstance
          .get<Vulnerability>(apiRoutes.pentester.vulnerabilities.details(pentestId!, vulnerabilityId!))
          .then((res) => res.data);
      } else {
        return axiosInstance
          .get<Vulnerability>(apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!))
          .then((res) => res.data);
      }
    },
    enabled: !loading && !!pentestId && !!vulnerabilityId
  })

  const { data: pentest, isLoading: isLoadingPentest } = useQuery({
    queryKey: ["pentest", pentestId],
    queryFn: () => {
      if (isClient()) {
        return axiosInstance.get<Pentest>(apiRoutes.client.pentests.details(pentestId!)).then((res) => res.data);
      } else if (isPentester()) {
        return axiosInstance.get<Pentest>(apiRoutes.pentester.pentestDetails(pentestId!)).then((res) => res.data);
      } else {
        return axiosInstance.get<Pentest>(apiRoutes.pentests.details(pentestId!)).then((res) => res.data);
      }
    },
    enabled: !loading 
  })

  const { mutate: updateVulnerabilityStatus, isPending: isUpdatingVulnerabilityStatus } = useMutation({
    mutationFn: (status: string) => {
      if (isClient()) {
        return axiosInstance.patch(apiRoutes.client.pentests.vulnerabilities.status(pentestId!, vulnerabilityId!), {
          status: status,
        });
      } else if (isPentester()) {
        return axiosInstance.patch(apiRoutes.pentester.vulnerabilities.updateStatus(pentestId!, vulnerabilityId!), {
          status: status,
        });
      } else {
        return axiosInstance.patch(apiRoutes.pentests.vulnerabilities.status(pentestId!, vulnerabilityId!), {
          status: status,
        });
      }
    },
    onSuccess: () => {
      refetchVulnerability()
      toast({
        title: "Status updated",
        description: "Vulnerability status has been updated successfully",
      })
    },
  })

  const { mutate: deleteVulnerability } = useMutation({
    mutationFn: () => axiosInstance.delete(isPentester() ? apiRoutes.pentester.vulnerabilities.delete(pentestId!, vulnerabilityId!) : apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!)),
    onSuccess: () => {
      navigate(`/vulnerability-reports/${pentestId}`)
      toast({
        title: "Vulnerability deleted",
        description: "The vulnerability has been deleted successfully",
      })
    },
  })

  const { mutate: sendToJira, isPending: isSendingToJira } = useMutation({
    mutationFn: () => {
      return axiosInstance.post(apiRoutes.client.pentests.vulnerabilities.sendToJira(pentest
        ?.clients.at(0)?._id!, pentestId!, vulnerabilityId!));
    },
    onSuccess: () => {
      toast({
        title: "Sent to Jira",
        description: "Vulnerability has been sent to Jira successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to send to Jira",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  })

  // Check if current user is the reporter of this vulnerability
  const isReporter = () => {
    if (!vulnerability || !user) return false;
    // Check if reporter exists and is an array
    if (!vulnerability.reporter) return false;
    // Check if the current user's ID is in the reporter array
    return vulnerability.reporter._id === user._id
  };

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
  ]

  const displayVulnerability = vulnerability
  const displayPentest = pentest

  if (isLoadingVulnerability || isLoadingPentest || loading || !displayVulnerability || !displayPentest) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin dark:text-gray-200" />
      </div>
    )
  }

  // if (!displayVulnerability || !displayPentest || loading) {
  //   return <div>No data found</div>
  // }

  return (
    <div className="w-full mx-auto py-6 font-sans dark:bg-gray-900">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main content - with dynamic width based on sidebar state */}
        <div className={`${useSidebar().isCollapsed ? 'lg:w-[75%]' : 'lg:w-[70%]'} space-y-6`}>
          {/* Title Card */}
          <Card className="py-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold break-words dark:text-gray-100">{displayVulnerability.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <VulnerabilitySeverityBadge severity={displayVulnerability.severity} />
                <VulnerabilityStatusBadge status={displayVulnerability.status} />
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: Affected Hosts */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">1. Affected Host(s)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Affected Host(s)</h3>
                <ul className="pl-6 space-y-1">
                  {displayVulnerability.affected_host.includes(",") ? (
                    displayVulnerability.affected_host.split(",").map((host, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-100 list-disc break-words whitespace-pre-wrap">
                        {host.trim()}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700 dark:text-gray-100 list-disc break-words whitespace-pre-wrap">{displayVulnerability.affected_host}</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Basic Details */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">2. Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Title</h3>
                <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">{displayVulnerability.title}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Severity</h3>
                <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">{displayVulnerability.severity}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Description</h3>
                <div
                  className="text-gray-700 dark:text-gray-100  max-w-none break-words whitespace-pre-wrap leading-normal
                  prose prose-gray dark:prose-invert prose-sm
                           prose-code:bg-muted dark:prose-code:bg-gray-900 
                           prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-700 dark:prose-code:text-gray-100
                           prose-pre:bg-muted dark:prose-pre:bg-gray-900 
                           prose-blockquote:border-border dark:prose-blockquote:border-border
                           prose-hr:border-border dark:prose-hr:border-border 
                           prose-table:border-collapse
                           prose-th:border prose-th:border-border dark:prose-th:border-border prose-th:px-3 prose-th:py-2
                           prose-td:border prose-td:border-border dark:prose-td:border-border prose-td:px-3 prose-td:py-2
                           prose-ul:py-0 prose-ul:leading-0 prose-ul:-my-4
                           prose-ol:py-0 prose-ol:leading-0 prose-ol:-my-4
                           prose-li:py-0 prose-li:my-0 prose-li:leading-0 prose-li:marker:text-sm dark:prose-li:marker:text-white prose-li:marker:text-gray-500
                           prose-img:m-0
                           prose-a:text-primary dark:prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                           hover:prose-a:text-primary/80 dark:hover:prose-a:text-primary/80
                           prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full
                           prose-headings:m-0 prose-headings:my-0 prose-headings:font-black prose-p:m-0 prose-p:my-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-pre:my-0
                           before:prose-code:hidden after:prose-code:hidden
                  "
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.description || "",
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Recommendations and Steps to Reproduce */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">3. Recommendations and Steps to Reproduce</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Steps to Reproduce</h3>
                <div
                  className="text-gray-700 dark:text-gray-100  max-w-none break-words whitespace-pre-wrap leading-normal
                  prose prose-gray dark:prose-invert prose-sm
                           prose-code:bg-muted dark:prose-code:bg-gray-900 
                           prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-700 dark:prose-code:text-gray-100
                           prose-pre:bg-muted dark:prose-pre:bg-gray-900 
                           prose-blockquote:border-border dark:prose-blockquote:border-border
                           prose-hr:border-border dark:prose-hr:border-border 
                           prose-table:border-collapse
                           prose-th:border prose-th:border-border dark:prose-th:border-border prose-th:px-3 prose-th:py-2
                           prose-td:border prose-td:border-border dark:prose-td:border-border prose-td:px-3 prose-td:py-2
                           prose-ul:py-0 prose-ul:leading-0 prose-ul:-my-4
                           prose-ol:py-0 prose-ol:leading-0 prose-ol:-my-4
                           prose-li:py-0 prose-li:my-0 prose-li:leading-0 prose-li:marker:text-sm dark:prose-li:marker:text-white prose-li:marker:text-gray-500
                           prose-img:m-0
                           prose-a:text-primary dark:prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                           hover:prose-a:text-primary/80 dark:hover:prose-a:text-primary/80
                           prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full
                           prose-headings:m-0 prose-headings:my-0 prose-headings:font-black prose-p:m-0 prose-p:my-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-pre:my-0
                           before:prose-code:hidden after:prose-code:hidden"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.steps_to_reproduce || "",
                  }}
                ></div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800 dark:text-gray-100">Recommended Solution</h3>
                <div
                  className="text-gray-700 dark:text-gray-100  max-w-none break-words whitespace-pre-wrap leading-normal
                  prose prose-gray dark:prose-invert prose-sm
                           prose-code:bg-muted dark:prose-code:bg-gray-900 
                           prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-700 dark:prose-code:text-gray-100
                           prose-pre:bg-muted dark:prose-pre:bg-gray-900 
                           prose-blockquote:border-border dark:prose-blockquote:border-border
                           prose-hr:border-border dark:prose-hr:border-border 
                           prose-table:border-collapse
                           prose-th:border prose-th:border-border dark:prose-th:border-border prose-th:px-3 prose-th:py-2
                           prose-td:border prose-td:border-border dark:prose-td:border-border prose-td:px-3 prose-td:py-2
                           prose-ul:py-0 prose-ul:leading-0 prose-ul:-my-4
                           prose-ol:py-0 prose-ol:leading-0 prose-ol:-my-4
                           prose-li:py-0 prose-li:my-0 prose-li:leading-0 prose-li:marker:text-sm dark:prose-li:marker:text-white prose-li:marker:text-gray-500
                           prose-img:m-0
                           prose-a:text-primary dark:prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                           hover:prose-a:text-primary/80 dark:hover:prose-a:text-primary/80
                           prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full
                           prose-headings:m-0 prose-headings:my-0 prose-headings:font-black prose-p:m-0 prose-p:my-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-pre:my-0
                           before:prose-code:hidden after:prose-code:hidden"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.recommended_solution || "",
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Impact and Likelihood */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">4. Impact and Likelihood</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Impact</h3>
                  <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">{displayVulnerability.impact}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Likelihood</h3>
                  <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">{displayVulnerability.likelihood}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: CVSS Metrics */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">5. CVSS Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Attack Vector</h3>
                    <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">
                      {displayVulnerability.cvssVector?.split("/")[1]?.split(":")[1] === "A"
                        ? "Adjacent Network"
                        : displayVulnerability.cvssVector?.split("/")[1]?.split(":")[1] === "N"
                          ? "Network"
                          : displayVulnerability.cvssVector?.split("/")[1]?.split(":")[1] === "L"
                            ? "Local"
                            : displayVulnerability.cvssVector?.split("/")[1]?.split(":")[1] === "P"
                              ? "Physical"
                              : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Attack Complexity</h3>
                    <p className="text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap">
                      {displayVulnerability.cvssVector?.split("/")[2]?.split(":")[1] === "L"
                        ? "Low"
                        : displayVulnerability.cvssVector?.split("/")[2]?.split(":")[1] === "H"
                          ? "High"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Privileges Required</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[3]?.split(":")[1] === "N"
                        ? "None"
                        : displayVulnerability.cvssVector?.split("/")[3]?.split(":")[1] === "L"
                          ? "Low"
                          : displayVulnerability.cvssVector?.split("/")[3]?.split(":")[1] === "H"
                            ? "High"
                            : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">User Interaction</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[4]?.split(":")[1] === "N"
                        ? "None"
                        : displayVulnerability.cvssVector?.split("/")[4]?.split(":")[1] === "R"
                          ? "Required"
                          : "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Scope</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[5]?.split(":")[1] === "U"
                        ? "Unchanged"
                        : displayVulnerability.cvssVector?.split("/")[5]?.split(":")[1] === "C"
                          ? "Changed"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Confidentiality</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[6]?.split(":")[1] === "N"
                        ? "None"
                        : displayVulnerability.cvssVector?.split("/")[6]?.split(":")[1] === "L"
                          ? "Low"
                          : displayVulnerability.cvssVector?.split("/")[6]?.split(":")[1] === "H"
                            ? "High"
                            : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Integrity</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[7]?.split(":")[1] === "N"
                        ? "None"
                        : displayVulnerability.cvssVector?.split("/")[7]?.split(":")[1] === "L"
                          ? "Low"
                          : displayVulnerability.cvssVector?.split("/")[7]?.split(":")[1] === "H"
                            ? "High"
                            : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">Availability</h3>
                    <p className="text-gray-700 dark:text-gray-100">
                      {displayVulnerability.cvssVector?.split("/")[8]?.split(":")[1] === "N"
                        ? "None"
                        : displayVulnerability.cvssVector?.split("/")[8]?.split(":")[1] === "L"
                          ? "Low"
                          : displayVulnerability.cvssVector?.split("/")[8]?.split(":")[1] === "H"
                            ? "High"
                            : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
              <p className="text-gray-700 dark:text-gray-100 mt-4 break-words whitespace-pre-wrap">
                {displayVulnerability.cvssVector}
              </p>
              <p className="font-bold">CVSS Score: <span className="font-normal">{displayVulnerability.cvss}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Attachments */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">6. Attachments</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FileAttachmentPreview attachments={displayVulnerability.attachments as Attachment[]} />
            </CardContent>
          </Card>

          {/* Comments Section */}
          <h2 className="text-2xl font-bold">Comments</h2>
          <div className="space-y-4">
            {displayVulnerability.comments.map((comment) => (
              <CommentCard
                key={comment._id}
                author={comment.user as User}
                content={comment.comment}
                createdAt={comment.createdAt}
                internal={comment.internal}
                attachments={comment.attachments as Attachment[]}
              />
            ))}
          </div>

          <CommentSection
            pentestId={pentestId ?? ""}
            vulnerabilityId={vulnerabilityId ?? ""}
            refetch={refetchVulnerability}
            isClient={isClient()}
          />
        </div>

        {/* Sidebar - Fixed position with proper spacing */}
        <div className={`${useSidebar().isCollapsed ? 'lg:w-[20%]' : 'lg:w-[15%]'} relative`}>
          <div className="hidden lg:block"> {/* Spacer div */}
            <div className="h-[600px]"></div>
          </div>
          <div className="lg:fixed lg:w-[inherit] max-w-[400px] bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-sm p-6 top-10">
            {/* Header with logo and title */}
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-xl lg:text-3xl font-bold text-[#1a1a2e] dark:text-gray-100 break-words">{displayPentest.title}</h1>
            </div>

            {/* Client info */}
            <div className="mb-6">
              <h2 className="text-lg lg:text-xl font-bold mb-3">{isClient() ? "Organization" : "Client"}:</h2>
              <div className="flex items-center gap-3">
                <img
                  src={displayPentest.clients[0].logoUrl || "/placeholder.svg"}
                  alt={displayPentest.clients[0].name}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
                />
                <span className="text-base lg:text-lg break-words whitespace-pre-wrap">{displayPentest.clients[0].name}</span>
              </div>
            </div>

            {/* Status */}
            <div className="mb-10">
              <h2 className="text-lg lg:text-xl font-bold mb-3">Status:</h2>
              <Select
                value={displayVulnerability.status}
                onValueChange={(value) => {
                  updateVulnerabilityStatus(value)
                }}
                disabled={isUpdatingVulnerabilityStatus}
              >
                <SelectTrigger
                  className={`w-full lg:w-[180px] bg-black border ${
                    statusOptions.find((option) => option.value === displayVulnerability.status)?.color
                  }`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className={`${option.color} ${option.textColor} my-1 rounded-md hover:${option.color} dark:hover:${option.color}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Divider */}
            <Separator className="my-6" />

            {/* Action buttons */}
            <div className="grid grid-flow-col gap-4 mb-4">
              {/* For Clients: Add Send to Jira button */}
              {isClient() && displayVulnerability.hasJiraIntegration && (
                <Button
                  variant="secondary"
                  className="flex items-center border-blue-500 hover:bg-blue-100 border justify-center gap-2 text-sm lg:text-base"
                  onClick={() => sendToJira()}
                  disabled={isSendingToJira}
                >
                  <img src="/Jira Icon.svg" alt="Jira" className="w-4 h-4 lg:w-5 lg:h-5" />
                  {displayVulnerability.hasJiraIntegration ? "Send to Jira" : "No Jira Integration"}
                </Button>
              )}
              
              {/* Show Edit button for admin (all vulnerabilities) or pentester who is the reporter */}
              {(isAdmin() || (isReporter() && isPentester())) && (
                <Button
                  variant="outline"
                  className="border-[#4a3a9c] text-[#4a3a9c] hover:bg-[#f0eeff] flex items-center justify-center gap-2 text-sm lg:text-base"
                  onClick={() => navigate(`/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerabilityId}/edit`)}
                >
                  <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                  Edit
                </Button>
              )}
              
              {/* Only show Delete button for admins, not pentesters or clients */}
              {!isPentester() && !isClient() && (
                <Button
                  variant="outline"
                  className="border-[#9c3a3a] text-[#9c3a3a] hover:bg-[#ffeeee] dark:border-[#9c3a3a] dark:text-[#9c3a3a] dark:hover:bg-red-900 dark:hover:text-white flex items-center justify-center gap-2 text-sm lg:text-base"
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to delete this vulnerability? This action cannot be undone.")
                    ) {
                      deleteVulnerability()
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
                  Delete
                </Button>
              )}
            </div>

            <Link to={`/vulnerability-reports/${pentestId}`}>
              <Button variant="outline" onClick={(e) => e.stopPropagation()} className="w-full border-[#3a4a6b] text-[#3a4a6b] hover:bg-[#eef0ff] text-sm lg:text-base">
                Go Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VulnerabilityView
