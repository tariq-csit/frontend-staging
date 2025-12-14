"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import FileAttachmentPreview from "./FileAttachmentsPreview"
import CommentSection from "./CommentSection"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { Attachment, Pentest, User, Vulnerability } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Edit, Loader2, Lock, Trash2, SendHorizontal, Clock, ChevronRight } from "lucide-react"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import CommentCard from "./CommentCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    if (status === "New") {
      return { 
        bg: "bg-[#E5E7EB] dark:bg-[#6B7280]", 
        text: "text-[#6B7280] dark:text-white", 
        border: "border-[#6B7280]",
        borderColor: "#6B7280"
      };
    } else if (status === "Triaged") {
      return { 
        bg: "bg-[#DAE6FD] dark:bg-[#2382F6]", 
        text: "text-[#2382F6] dark:text-white", 
        border: "border-[#2382F6]",
        borderColor: "#2382F6"
      };
    } else if (status === "Ready For Retest") {
      return { 
        bg: "bg-[#FDE68A] dark:bg-[#F59E0B]", 
        text: "text-[#92400E] dark:text-white", 
        border: "border-[#F59E0B]",
        borderColor: "#F59E0B"
      };
    } else if (status === "Resolved") {
      return { 
        bg: "bg-[#86EFAC] dark:bg-[#166534]", 
        text: "text-[#166534] dark:text-white", 
        border: "border-[#166534]",
        borderColor: "#166534"
      };
    } else if (status === "Not Applicable") {
      return { 
        bg: "bg-[#FCA5A5] dark:bg-[#991B1B]", 
        text: "text-[#991B1B] dark:text-white", 
        border: "border-[#991B1B]",
        borderColor: "#991B1B"
      };
    }
    return { 
      bg: "bg-gray-200 dark:bg-gray-700", 
      text: "text-gray-700 dark:text-gray-300", 
      border: "border-gray-400",
      borderColor: "#9CA3AF"
    };
  }

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
              <CardTitle className="text-xl font-semibold dark:text-gray-100">3. Steps to Reproduce and Recommendations</CardTitle>
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
            <div className="mb-6">
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

            {/* Status History - Compact Preview */}
            {displayVulnerability.statusHistory && displayVulnerability.statusHistory.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg lg:text-xl font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Status History
                  </h2>
                  <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary hover:text-primary/80 h-auto p-1"
                      >
                        View All
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-900">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          Status Change History
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-0 mt-6">
                        {displayVulnerability.statusHistory.map((historyEntry, index) => {
                          const changedBy = historyEntry.changedBy;
                          const changedByName = changedBy?.name || "System";
                          const changedByAvatar = changedBy?.profilePicture;
                          const changedAt = new Date(historyEntry.changedAt);
                          const formattedDate = changedAt.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          const toStatusColor = getStatusColor(historyEntry.toStatus);
                          const fromStatusColor = historyEntry.fromStatus ? getStatusColor(historyEntry.fromStatus) : null;

                          return (
                            <div
                              key={index}
                              className={`relative flex gap-4 p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                historyEntry.isCurrent
                                  ? "bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30 border-2 border-primary/30"
                                  : "border border-gray-200 dark:border-gray-800"
                              } ${index < displayVulnerability.statusHistory!.length - 1 ? "mb-4" : ""}`}
                            >
                              {/* Timeline line */}
                              {index < displayVulnerability.statusHistory!.length - 1 && (
                                <div className="absolute left-[28px] top-[60px] w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
                              )}

                              {/* Avatar with status color ring */}
                              <div className="relative flex-shrink-0">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-offset-2 ${
                                    historyEntry.isCurrent
                                      ? `${toStatusColor.border} ring-primary/20 dark:ring-primary/40`
                                      : "ring-gray-200 dark:ring-gray-700"
                                  }`}
                                  style={{
                                    boxShadow: historyEntry.isCurrent
                                      ? `0 0 0 2px ${toStatusColor.borderColor}, 0 4px 12px rgba(0,0,0,0.1)`
                                      : undefined
                                  }}
                                >
                                  {changedByAvatar ? (
                                    <img
                                      src={changedByAvatar}
                                      alt={changedByName}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className={`w-12 h-12 rounded-full ${toStatusColor.bg} flex items-center justify-center`}>
                                      <span className={`text-sm font-bold ${toStatusColor.text}`}>
                                        {changedByName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {historyEntry.isCurrent && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {changedByName}
                                  </span>
                                  {historyEntry.isCurrent && (
                                    <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-primary to-primary/80 text-white rounded-full shadow-sm">
                                      Current
                                    </span>
                                  )}
                                </div>

                                {/* Status change with colored badges */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {historyEntry.fromStatus ? (
                                    <>
                                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${fromStatusColor?.bg} ${fromStatusColor?.text} border ${fromStatusColor?.border} shadow-sm`}>
                                        {historyEntry.fromStatus}
                                      </span>
                                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Initial status:</span>
                                  )}
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${toStatusColor.bg} ${toStatusColor.text} border ${toStatusColor.border} shadow-sm ${historyEntry.isCurrent ? "ring-2 ring-primary/30" : ""}`}>
                                    {historyEntry.toStatus}
                                  </span>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formattedDate}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {displayVulnerability.statusHistory
                    .slice(-2)
                    .reverse()
                    .map((historyEntry, index) => {
                      const changedBy = historyEntry.changedBy;
                      const changedByName = changedBy?.name || "System";
                      const changedByAvatar = changedBy?.profilePicture;
                      const changedAt = new Date(historyEntry.changedAt);
                      const formattedDate = changedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const toStatusColor = getStatusColor(historyEntry.toStatus);
                      const fromStatusColor = historyEntry.fromStatus ? getStatusColor(historyEntry.fromStatus) : null;

                      return (
                        <div
                          key={index}
                          className={`group flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                            historyEntry.isCurrent
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/30 shadow-sm"
                              : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className={`relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ${
                            historyEntry.isCurrent
                              ? `${toStatusColor.border} ring-primary/20`
                              : "ring-gray-200 dark:ring-gray-700"
                          }`}>
                            {changedByAvatar ? (
                              <img
                                src={changedByAvatar}
                                alt={changedByName}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-7 h-7 rounded-full ${toStatusColor.bg} flex items-center justify-center`}>
                                <span className={`text-[10px] font-bold ${toStatusColor.text}`}>
                                  {changedByName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {historyEntry.isCurrent && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-white dark:border-gray-900" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                              {changedByName}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              {historyEntry.fromStatus && (
                                <>
                                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${fromStatusColor?.bg} ${fromStatusColor?.text} border ${fromStatusColor?.border}`}>
                                    {historyEntry.fromStatus}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-gray-400" />
                                </>
                              )}
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${toStatusColor.bg} ${toStatusColor.text} border ${toStatusColor.border} ${historyEntry.isCurrent ? "ring-1 ring-primary/30" : ""}`}>
                                {historyEntry.toStatus}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

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
