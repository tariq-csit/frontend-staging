import { Vulnerability } from "@/types/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function GridFormat(props: {
  vulnerabilities: Vulnerability[]
}) {
  const {vulnerabilities} = props;

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
        {vulnerabilities?.map((data, i) => {
          return (
            <div key={i} className="border-inputBorder p-4 flex justify-between items-center border rounded-md">
              <div className="flex gap-10">
                <div className="flex flex-col gap-1 min-w-64">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">{data.title}</p>
                </div>

                <div className="flex gap-8 min-w-[224px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <div
                      className={`flex px-4 justify-center items-center py-1 rounded-[8px] 
                      ${data.severity === "Low" && "bg-priorityBlue"}
                      ${data.severity === "High" && "bg-priorityRed"}`}
                    >
                      <p
                        className={`font-inter text-sm capitalize
                        ${data.severity === "Low" && "text-priorityTextBlue"}
                        ${data.severity === "High" && "text-priorityTextRed"}
                        `}
                      >
                        {data.severity}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div
                      className={`flex px-4 justify-center items-center py-1 rounded-[8px] 
                      ${data.status === "Open" && "bg-statusSilver"}
                      ${data.status === "In Progress" && "bg-statusOrange"}
                      ${data.status === "Resolved" && "bg-statusGreen"}`}
                    >
                      <p
                        className={`font-inter text-sm capitalize
                        ${data.status === "Open" && "text-statusTextSilver"}
                        ${data.status === "In Progress" && "text-statusTextOrange"}
                        ${data.status === "High" && "text-statusTextGreen"}
                        `}
                      >
                        {data.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Reported by</span>
                    <p className="font-medium">{data.reporter.name}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Reported on</span>
                    <p className="font-medium">{format(new Date(data.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              <Link className="text-primary-900 text-sm" to={`/dashboard/vulnerability-reports/${data.pentest}/${data._id}`}>View details</Link>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default GridFormat;
