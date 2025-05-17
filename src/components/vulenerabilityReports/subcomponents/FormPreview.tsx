"use client"

import { Button } from "@/components/ui/button"
import FileAttachmentPreview from "./FileAttachmentsPreview"
import CommentSection from "./CommentSection"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { Attachment, Pentest, User, Vulnerability } from "@/types/types"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Edit, Loader2, Lock, Trash2 } from "lucide-react"
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
  const { isPentester, loading } = useUser();

  const { data: vulnerability, refetch: refetchVulnerability, isLoading: isLoadingVulnerability } = useQuery({
    queryKey: ["pentest", pentestId, "vulnerability", vulnerabilityId],
    queryFn: () =>
      axiosInstance
        .get<Vulnerability>(isPentester() ? apiRoutes.pentester.vulnerabilities.details(pentestId!, vulnerabilityId!) : apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!))
        .then((res) => res.data),
    enabled: !loading 
  })

  const { data: pentest, isLoading: isLoadingPentest } = useQuery({
    queryKey: ["pentest", pentestId],
    queryFn: () => axiosInstance.get<Pentest>(isPentester() ? apiRoutes.pentester.pentestDetails(pentestId!) : apiRoutes.pentests.details(pentestId!)).then((res) => res.data),
    enabled: !loading 
  })

  const { mutate: updateVulnerabilityStatus, isPending: isUpdatingVulnerabilityStatus } = useMutation({
    mutationFn: (status: string) =>
      axiosInstance.patch(isPentester() ? apiRoutes.pentester.vulnerabilities.updateStatus(pentestId!, vulnerabilityId!) : apiRoutes.pentests.vulnerabilities.status(pentestId!, vulnerabilityId!), {
        status: status,
      }),
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

  const statusOptions: StatusOption[] = [
    { 
      value: "New", 
      label: "New", 
      color: "bg-[#E5E7EB]",
      textColor: "text-[#6B7280]" 
    },
    { 
      value: "Triaged", 
      label: "Triaged", 
      color: "bg-[#DAE6FD]",
      textColor: "text-[#2382F6]" 
    },
    { 
      value: "Ready For Retest", 
      label: "Ready for Retest", 
      color: "bg-[#FDE68A]",
      textColor: "text-[#92400E]" 
    },
    { 
      value: "Resolved", 
      label: "Resolved", 
      color: "bg-[#86EFAC]",
      textColor: "text-[#166534]" 
    },
    { 
      value: "Not Applicable", 
      label: "Not Applicable", 
      color: "bg-[#FCA5A5]",
      textColor: "text-[#991B1B]" 
    },
  ]

  const displayVulnerability = vulnerability
  const displayPentest = pentest

  if (isLoadingVulnerability || isLoadingPentest) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (!displayVulnerability || !displayPentest) {
    return <div>No data found</div>
  }

  return (
    <div className="w-full mx-auto py-6 font-sans">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">
        {/* Main content - with dynamic width based on sidebar state */}
        <div className={`${useSidebar().isCollapsed ? 'lg:w-[75%]' : 'lg:w-[70%]'} space-y-6`}>
          {/* Title Card */}
          <Card className="py-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold break-words">{displayVulnerability.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <VulnerabilitySeverityBadge severity={displayVulnerability.severity} />
                <VulnerabilityStatusBadge status={displayVulnerability.status} />
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: Affected Hosts */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">1. Affected Host(s)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Affected Host(s)</h3>
                <ul className="pl-6 space-y-1">
                  {displayVulnerability.affected_host.includes(",") ? (
                    displayVulnerability.affected_host.split(",").map((host, i) => (
                      <li key={i} className="text-gray-700 list-disc break-words whitespace-pre-wrap">
                        {host.trim()}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700 list-disc break-words whitespace-pre-wrap">{displayVulnerability.affected_host}</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Basic Details */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">2. Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Title</h3>
                <p className="text-gray-700 break-words whitespace-pre-wrap">{displayVulnerability.title}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Severity</h3>
                <p className="text-gray-700 break-words whitespace-pre-wrap">{displayVulnerability.severity}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Description</h3>
                <div
                  className="text-gray-700 prose max-w-none break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.description || "",
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Recommendations and Steps to Reproduce */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">3. Recommendations and Steps to Reproduce</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Steps to Reproduce</h3>
                <div
                  className="text-gray-700 prose max-w-none break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.steps_to_reproduce || "",
                  }}
                ></div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Recommended Solution</h3>
                <div
                  className="text-gray-700 prose max-w-none break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.recommended_solution || "",
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Impact and Likelihood */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">4. Impact and Likelihood</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Impact</h3>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">{displayVulnerability.impact}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Likelihood</h3>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">{displayVulnerability.likelihood}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: CVSS Metrics */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">5. CVSS Metrics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800">Attack Vector</h3>
                    <p className="text-gray-700 break-words whitespace-pre-wrap">
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
                    <h3 className="font-medium text-gray-800">Attack Complexity</h3>
                    <p className="text-gray-700 break-words whitespace-pre-wrap">
                      {displayVulnerability.cvssVector?.split("/")[2]?.split(":")[1] === "L"
                        ? "Low"
                        : displayVulnerability.cvssVector?.split("/")[2]?.split(":")[1] === "H"
                          ? "High"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Privileges Required</h3>
                    <p className="text-gray-700">
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
                    <h3 className="font-medium text-gray-800">User Interaction</h3>
                    <p className="text-gray-700">
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
                    <h3 className="font-medium text-gray-800">Scope</h3>
                    <p className="text-gray-700">
                      {displayVulnerability.cvssVector?.split("/")[5]?.split(":")[1] === "U"
                        ? "Unchanged"
                        : displayVulnerability.cvssVector?.split("/")[5]?.split(":")[1] === "C"
                          ? "Changed"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Confidentiality</h3>
                    <p className="text-gray-700">
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
                    <h3 className="font-medium text-gray-800">Integrity</h3>
                    <p className="text-gray-700">
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
                    <h3 className="font-medium text-gray-800">Availability</h3>
                    <p className="text-gray-700">
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
              <div className="flex justify-between">
              <p className="text-gray-700 mt-4 break-words whitespace-pre-wrap">
                {displayVulnerability.cvssVector}
              </p>
              <p>CVSS Score: {displayVulnerability.cvss}</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Attachments */}
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold">6. Attachments</CardTitle>
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
          />
        </div>

        {/* Sidebar - Fixed position with proper spacing */}
        <div className={`${useSidebar().isCollapsed ? 'lg:w-[20%]' : 'lg:w-[15%]'} relative`}>
          <div className="hidden lg:block"> {/* Spacer div */}
            <div className="h-[600px]"></div>
          </div>
          <div className="lg:fixed lg:w-[inherit] max-w-[400px] bg-white rounded-lg shadow-sm p-6 top-10">
            {/* Header with logo and title */}
            <div className="flex items-center gap-4 mb-6">
              {/* <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-[#f2f9e8] flex items-center justify-center">
                <div className="relative">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-[#a5d86a] flex items-center justify-center">
                    <Lock className="text-white w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                  <div className="absolute inset-0 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#6bbbf7"
                        strokeWidth="2"
                        strokeDasharray="10 5"
                      />
                    </svg>
                  </div>
                </div>
              </div> */}
              <h1 className="text-xl lg:text-3xl font-bold text-[#1a1a2e] break-words">{displayPentest.name}</h1>
            </div>

            {/* Client info */}
            <div className="mb-6">
              <h2 className="text-lg lg:text-xl font-bold mb-3">Client:</h2>
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
                  className={`w-full lg:w-[180px] ${
                    statusOptions.find((option) => option.value === displayVulnerability.status)?.color
                  } border-none`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className={`${option.color} ${option.textColor} my-1 rounded-md`}>
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
              <Button
                variant="outline"
                className="border-[#4a3a9c] text-[#4a3a9c] hover:bg-[#f0eeff] flex items-center justify-center gap-2 text-sm lg:text-base"
                onClick={() => navigate(`/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerabilityId}/edit`)}
              >
                <Edit className="h-4 w-4 lg:h-5 lg:w-5" />
                Edit
              </Button>
              {!isPentester() && (
              <Button
                variant="outline"
                className="border-[#9c3a3a] text-[#9c3a3a] hover:bg-[#ffeeee] flex items-center justify-center gap-2 text-sm lg:text-base"
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
              <Button variant="outline" className="w-full border-[#3a4a6b] text-[#3a4a6b] hover:bg-[#eef0ff] text-sm lg:text-base">
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
