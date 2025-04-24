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

interface StatusOption {
  value: string
  label: string
  color: string
}

function VulnerabilityView() {
  const { pentestId, vulnerabilityId } = useParams<{ pentestId: string; vulnerabilityId: string }>()
  const navigate = useNavigate()

  const { data: vulnerability, refetch: refetchVulnerability, isLoading: isLoadingVulnerability } = useQuery({
    queryKey: ["pentest", pentestId, "vulnerability", vulnerabilityId],
    queryFn: () =>
      axiosInstance
        .get<Vulnerability>(apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!))
        .then((res) => res.data),
  })

  const { data: pentest, isLoading: isLoadingPentest } = useQuery({
    queryKey: ["pentest", pentestId],
    queryFn: () => axiosInstance.get<Pentest>(apiRoutes.pentests.details(pentestId!)).then((res) => res.data),
  })

  const { mutate: updateVulnerabilityStatus, isPending: isUpdatingVulnerabilityStatus } = useMutation({
    mutationFn: (status: string) =>
      axiosInstance.patch(apiRoutes.pentests.vulnerabilities.status(pentestId!, vulnerabilityId!), {
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
    mutationFn: () => axiosInstance.delete(apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!)),
    onSuccess: () => {
      navigate(`/vulnerability-reports/${pentestId}`)
      toast({
        title: "Vulnerability deleted",
        description: "The vulnerability has been deleted successfully",
      })
    },
  })

  const statusOptions: StatusOption[] = [
    { value: "New", label: "New", color: "bg-gray-100" },
    { value: "Triaged", label: "Triaged", color: "bg-blue-100" },
    { value: "Ready For Retest", label: "Ready for Retest", color: "bg-amber-100" },
    { value: "Resolved", label: "Resolved", color: "bg-green-100" },
    { value: "Not Applicable", label: "Not Applicable", color: "bg-red-100" },
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
    <div className="w-full mx-auto py-6 px-4 font-sans">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="lg:w-9/12 space-y-6">
          {/* Title Card */}
          <Card className="py-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{displayVulnerability.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 text-sm rounded-md bg-blue-100 text-blue-800">
                  Severity: {displayVulnerability.severity}
                </span>
                <span
                  className={`px-2 py-1 text-sm rounded-md ${
                    statusOptions.find((option) => option.value === displayVulnerability.status)?.color || "bg-gray-100"
                  }`}
                >
                  Status: {displayVulnerability.status}
                </span>
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
                      <li key={i} className="text-gray-700 list-disc">
                        {host.trim()}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700 list-disc">{displayVulnerability.affected_host}</li>
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
                <p className="text-gray-700">{displayVulnerability.title}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Severity</h3>
                <p className="text-gray-700">{displayVulnerability.severity}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Description</h3>
                <div
                  className="text-gray-700 prose max-w-none"
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
                  className="text-gray-700 prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: displayVulnerability.steps_to_reproduce || "",
                  }}
                ></div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Recommended Solution</h3>
                <div
                  className="text-gray-700 prose max-w-none"
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
                  <p className="text-gray-700">{displayVulnerability.impact}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Likelihood</h3>
                  <p className="text-gray-700">{displayVulnerability.likelihood}</p>
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
                    <p className="text-gray-700">
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
                    <p className="text-gray-700">
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
              <p className="text-gray-700 mt-4">
                {displayVulnerability.cvssVector}
              </p>
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

        {/* Sidebar - Fixed position */}
        <div className="lg:w-3/12 sticky">
          <div className="sticky top-6 max-w-md bg-white rounded-lg shadow-sm p-6">
            {/* Header with logo and title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-[#f2f9e8] flex items-center justify-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#a5d86a] flex items-center justify-center">
                    <Lock className="text-white w-6 h-6" />
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
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">{displayPentest.name}</h1>
            </div>

            {/* Client info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Client:</h2>
              <div className="flex items-center gap-3">
                <img
                  src={displayPentest.clients[0].logoUrl || "/placeholder.svg"}
                  alt={displayPentest.clients[0].name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-lg">{displayPentest.clients[0].name}</span>
              </div>
            </div>

            {/* Status */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-3">Status:</h2>
              <Select
                value={displayVulnerability.status}
                onValueChange={(value) => {
                  updateVulnerabilityStatus(value)
                }}
                disabled={isUpdatingVulnerabilityStatus}
              >
                <SelectTrigger
                  className={`w-[180px] ${
                    statusOptions.find((option) => option.value === displayVulnerability.status)?.color
                  } border-none`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className={`${option.color} my-1 rounded-md`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Divider */}
            <Separator className="my-6" />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                variant="outline"
                className="border-[#4a3a9c] text-[#4a3a9c] hover:bg-[#f0eeff] flex items-center justify-center gap-2"
                onClick={() => navigate(`/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerabilityId}/edit`)}
              >
                <Edit className="h-5 w-5" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="border-[#9c3a3a] text-[#9c3a3a] hover:bg-[#ffeeee] flex items-center justify-center gap-2"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this vulnerability? This action cannot be undone.")
                  ) {
                    deleteVulnerability()
                  }
                }}
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </Button>
            </div>

            <Link to={`/vulnerability-reports/${pentestId}`}>
              <Button variant="outline" className="w-full border-[#3a4a6b] text-[#3a4a6b] hover:bg-[#eef0ff]">
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
