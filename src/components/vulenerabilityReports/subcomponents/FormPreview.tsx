import { Button } from "@/components/ui/button";
import FileAttachmentPreview from "./FileAttachmentsPreview";
import CommentSection from "./CommentSection";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { Vulnerability } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Trash2, Lock } from "lucide-react";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";


interface StatusOption {
  value: string;
  label: string;
  color: string;
}

function formPreview() {
  const {pentestId, vulnerabilityId} = useParams<{pentestId: string, vulnerabilityId: string}>();

  const navigate = useNavigate()

  const {data: vulnerability, refetch: refetchVulnerability} = useQuery({
    queryKey: ["pentest", pentestId, "vulnerability", vulnerabilityId],
    queryFn: () => axiosInstance.get<Vulnerability>(apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!)).then((res) => res.data)
  })

  const {mutate: updateVulnerabilityStatus} = useMutation({
    mutationFn: (status: string) => axiosInstance.patch(apiRoutes.pentests.vulnerabilities.status(pentestId!, vulnerabilityId!),
      {
        status: status
      }
    ),
    onSuccess: () => {
      refetchVulnerability()
    }
  })

  // delete mutation
  const {mutate: deleteVulnerability} = useMutation({
    mutationFn: () => axiosInstance.delete(apiRoutes.pentests.vulnerabilities.details(pentestId!, vulnerabilityId!)),
    onSuccess: () => {
      refetchVulnerability()
      navigate(`/dashboard/vulnerability-reports/${pentestId}`)
      toast({
        title: "Vulnerability deleted successfully",
        description: "The vulnerability has been deleted successfully",
      })
    }
  })


  const statusOptions: StatusOption[] = [
    { value: "New", label: "New", color: "bg-gray-100" },
    { value: "Triaged", label: "Triaged", color: "bg-blue-100" },
    { value: "Ready For Retest", label: "Ready for Retest", color: "bg-amber-100" },
    { value: "Resolved", label: "Resolved", color: "bg-green-100" },
    { value: "Not Applicable", label: "Not Applicable", color: "bg-red-100" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-8 font-poppins">
      <div className="sm:w-9/12 flex flex-col gap-6">
        <div className="w-full flex flex-col gap-6 p-6 bg-white rounded-lg">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-medium">
              Submit vulnerability report
            </h2>
            <p>
              Provide detailed information to ensure easy validation and review.
              Include affected hosts, severity, CVSS metrics, steps to
              reproduce, and relevant attachments for a thorough report. All
              fields are mandatory unless marked as optional.{" "}
            </p>
          </div>
          <h1 className="text-2xl font-medium mb-6">1. Affected Host (s)</h1>
          <div className="flex flex-col gap-4">
            <p className="font-medium">Affected Host (s)</p>
            <ul className="px-6">
              {vulnerability?.affected_host.includes(",") ? vulnerability?.affected_host.split(",").map((host, i) => {
                return (
                  <li key={i} className="text-previewText list-disc">
                    {host}
                  </li>
                );
              }) : (
                <li className="text-previewText list-disc">
                  {vulnerability?.affected_host}
                </li>
              )}
            </ul>
          </div>

          <h1 className="text-2xl font-medium mb-6">2. Basic Details (s)</h1>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Title</p>
            <p className="text-previewText">{vulnerability?.title}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Severity</p>
            <p className="text-previewText">{vulnerability?.severity}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Description</p>
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: vulnerability?.description || "",
              }}
            ></div>
          </div>

          <h1 className="text-2xl font-medium mb-6">
            3. Recommendations and Steps to Reproduce (s)
          </h1>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Steps to Reproduce</p>
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: vulnerability?.steps_to_reproduce || "",
              }}
            ></div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium">Recommended Solution</p>
            <div
              className="text-previewText"
              dangerouslySetInnerHTML={{
                __html: vulnerability?.recommended_solution || "",
              }}
            ></div>
          </div>

          <h1 className="text-2xl font-medium mb-6">
            4. Impact and Likelihood (s)
          </h1>
          <div className="grid sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="font-medium">Impact</p>
              <p className="text-previewText">{vulnerability?.impact}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium">LikeliHood</p>
              <p className="text-previewText">{vulnerability?.likelihood}</p>
            </div>
          </div>

          <h1 className="text-2xl font-medium mb-6">5. CVSS Metrics</h1>
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Attack Vector</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[1]?.split(':')[1] === 'A' ? 'Adjacent Network' :
                   vulnerability?.cvssVector?.split('/')[1]?.split(':')[1] === 'N' ? 'Network' :
                   vulnerability?.cvssVector?.split('/')[1]?.split(':')[1] === 'L' ? 'Local' :
                   vulnerability?.cvssVector?.split('/')[1]?.split(':')[1] === 'P' ? 'Physical' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Attack Complexity</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[2]?.split(':')[1] === 'L' ? 'Low' :
                   vulnerability?.cvssVector?.split('/')[2]?.split(':')[1] === 'H' ? 'High' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Privileges Required</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[3]?.split(':')[1] === 'N' ? 'None' :
                   vulnerability?.cvssVector?.split('/')[3]?.split(':')[1] === 'L' ? 'Low' :
                   vulnerability?.cvssVector?.split('/')[3]?.split(':')[1] === 'H' ? 'High' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">User Interaction</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[4]?.split(':')[1] === 'N' ? 'None' :
                   vulnerability?.cvssVector?.split('/')[4]?.split(':')[1] === 'R' ? 'Required' : '-'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Scope</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[5]?.split(':')[1] === 'U' ? 'Unchanged' :
                   vulnerability?.cvssVector?.split('/')[5]?.split(':')[1] === 'C' ? 'Changed' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Confidentiality</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[6]?.split(':')[1] === 'N' ? 'None' :
                   vulnerability?.cvssVector?.split('/')[6]?.split(':')[1] === 'L' ? 'Low' :
                   vulnerability?.cvssVector?.split('/')[6]?.split(':')[1] === 'H' ? 'High' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Integrity</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[7]?.split(':')[1] === 'N' ? 'None' :
                   vulnerability?.cvssVector?.split('/')[7]?.split(':')[1] === 'L' ? 'Low' :
                   vulnerability?.cvssVector?.split('/')[7]?.split(':')[1] === 'H' ? 'High' : '-'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Availability</p>
                <p className="text-previewText">
                  {vulnerability?.cvssVector?.split('/')[8]?.split(':')[1] === 'N' ? 'None' :
                   vulnerability?.cvssVector?.split('/')[8]?.split(':')[1] === 'L' ? 'Low' :
                   vulnerability?.cvssVector?.split('/')[8]?.split(':')[1] === 'H' ? 'High' : '-'}
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-medium mb-6">6. Attachments</h1>
          <FileAttachmentPreview attachments={vulnerability?.attachments} />
        </div>
        <CommentSection />
      </div>

      <div className="max-w-md mx-auto bg-white h-fit rounded-lg shadow-sm p-6">
      {/* Header with logo and title */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-[#f2f9e8] flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#a5d86a] flex items-center justify-center">
              <Lock className="text-white w-6 h-6" />
            </div>
            <div className="absolute inset-0 w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#6bbbf7" strokeWidth="2" strokeDasharray="10 5" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#1a1a2e]">Pentest Title</h1>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-8 text-lg">
        A Penetration Test, Or Pentest, Is A Simulated Cyber Attack Against Your Computer System To Check For
        Vulnerabilities That An Attacker Could Exploit. It Involves Assessing The Security O...
      </p>

      {/* Client info */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Client:</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
            <div className="w-6 h-6 rounded-full bg-[#3a4a6b]"></div>
          </div>
          <span className="text-lg">Digital Circle (Cloud Hosting Services)</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-3">Status:</h2>
        <Select value={vulnerability?.status} onValueChange={(value) => {
          updateVulnerabilityStatus(value)
        }}>
          <SelectTrigger className={`w-[180px] ${statusOptions.find(option => option.value === vulnerability?.status)?.color} border-none`}>
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
      <div className="border-t border-gray-200 my-6"></div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button
          variant="outline"
          className="border-[#4a3a9c] text-[#4a3a9c] hover:bg-[#f0eeff] flex items-center justify-center gap-2"
        >
          <Edit className="h-5 w-5" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="border-[#9c3a3a] text-[#9c3a3a] hover:bg-[#ffeeee] flex items-center justify-center gap-2"
          onClick={() => deleteVulnerability()}
        >
          <Trash2 className="h-5 w-5" />
          Delete
        </Button>
      </div>

      <Link to={`/dashboard/vulnerability-reports/${pentestId}`}>
        <Button variant="outline" className="w-full border-[#3a4a6b] text-[#3a4a6b] hover:bg-[#eef0ff]">
          Go Back
        </Button>
      </Link>
    </div>
    </div>
  );
}

export default formPreview;
