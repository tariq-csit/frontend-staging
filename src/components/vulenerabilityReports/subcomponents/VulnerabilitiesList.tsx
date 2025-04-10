import { Vulnerability } from "@/types/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function VulnerabilitiesList(props: {
  vulnerabilities: Vulnerability[]
  pentestId: string
}) {
  const {vulnerabilities} = props;
  console.log(vulnerabilities)

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex flex-col overflow-x-auto justify-between gap-6 w-full font-poppins">
        <div className="flex flex-col gap-4 min-w-[1000px]">
          <p>No vulnerabilities found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-x-auto justify-between gap-6 w-full font-poppins">
      <div className="flex flex-col gap-4 min-w-[1000px]">
        {vulnerabilities?.map((vulnerability, i) => {
          return (
            <div key={i} className="border-inputBorder p-4 grid grid-cols-9 items-center gap-8 border rounded-md">
              <div className="flex flex-col gap-1 col-span-4">
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{vulnerability.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <div
                    className={`flex px-4 justify-center items-center py-1 rounded-[8px] w-24
                    ${vulnerability.severity.toLowerCase() === "low" && "bg-priorityBlue"}
                    ${vulnerability.severity.toLowerCase() === "high" && "bg-priorityRed"}
                    ${vulnerability.severity.toLowerCase() === "medium" && "bg-orange-200"}
                    ${vulnerability.severity.toLowerCase() === "critical" && "bg-red-600"}`}
                  >
                    <p
                      className={`font-inter text-sm capitalize
                      ${vulnerability.severity.toLowerCase() === "low" && "text-priorityTextBlue"}
                      ${vulnerability.severity.toLowerCase() === "high" && "text-priorityTextRed"}
                      ${vulnerability.severity.toLowerCase() === "medium" && "text-orange-900"}
                      ${vulnerability.severity.toLowerCase() === "critical" && "text-white"}
                      `}
                    >
                      {vulnerability.severity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div
                    className={`flex px-4 justify-center items-center py-1 rounded-[8px] w-24
                    ${vulnerability.status === "New" && "bg-statusSilver"}
                    ${vulnerability.status === "Triaged" && "bg-statusOrange"}
                    ${vulnerability.status === "Ready For Retest" && "bg-statusGreen"}
                    ${vulnerability.status === "Resolved" && "bg-statusGreen"}
                    ${vulnerability.status === "Not Applicable" && "bg-statusRed"}`}
                  >
                    <p
                      className={`font-inter text-sm capitalize
                      ${vulnerability.status === "New" && "text-statusTextSilver"}
                      ${vulnerability.status === "Triaged" && "text-statusTextOrange"}
                      ${vulnerability.status === "Ready For Retest" && "text-statusTextGreen"}
                      ${vulnerability.status === "Resolved" && "text-statusTextGreen"}
                      ${vulnerability.status === "Not Applicable" && "text-statusTextRed"}
                      `}
                    >
                      {vulnerability.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Reported by</span>
                  <p className="font-medium">{vulnerability.reporter.name}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Reported on</span>
                  <p className="font-medium">{format(new Date(vulnerability.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>

              <div className="col-span-1 flex justify-end items-center">
                <Link className="text-primary-900 text-sm" to={`/vulnerability-reports/${props.pentestId}/vulnerabilities/${vulnerability._id}`}>View details</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default VulnerabilitiesList;
