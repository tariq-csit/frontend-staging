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


        {/* {listData.map((data, index) => {
          return (
            <div
              key={index}
              className={`grid grid-cols-9 place-items-start bg-white/80 border  gap-0`}
            >
              <div className="flex justify-center h-12 p-2.5 items-center gapx-4 py-3 self-stretch">
                <p
                  key={index}
                  className="text-sm font-poppins flex-component text-primary-900"
                >
                  {data.title}
                </p>
              </div>
              <div className="flex justify-center h-12 p-2.5 items-center gapx-4 py-3 self-stretch">
                <div
                  className={`flex w-9 h-[1.4375rem] py-1 px-[0.375rem] justify-center items-center gapx-4 py-3 rounded-chart 
        ${data.priority === "low" && "bg-[#DFA87433]"}
        ${data.priority === "high" && "bg-[#D8727D1A]"}
        ${data.priority === "critical" && "bg-[#D5494933] w-[3.25744rem]"}
        ${data.priority === "completed" && "bg-[#83C29D33] w-[4.75rem]"}`}
                >
                  <p
                    className={`font-inter text-xs font-medium capitalize
          ${data.priority === "low" && "text-[#D58D49]"}
          ${data.priority === "high" && "text-[#D8727D]"}
          ${data.priority === "critical" && "text-[#D54949]"}
          ${data.priority === "completed" && "text-[#68B266]"}
          `}
                  >
                    {data.priority}
                  </p>
                </div>
              </div>
              <div className="flex justify-center h-12 p-2.5 items-center gapx-4 py-3 self-stretch">
                <div
                  className={`flex w-24 py-1 px-2.5 justify-center items-center gap-2.5 rounded-chart 
                    ${data.status === "Complete" && "bg-statusGreen"}
                    ${data.status === "On Going" && "bg-statusOrange"}  
                    ${data.status === "Not Started" && "bg-statusSilver"} `}
                >
                  <p
                    className={` text-xs font-poppins
                      ${data.status === "Complete" && "text-statusTextGreen"}
                      ${data.status === "On Going" && "text-statusTextOrange"}
                      ${
                        data.status === "Not Started" && "text-statusTextSilver"
                      }`}
                  >
                    {data.status}
                  </p>
                </div>
              </div>

              <div className="flex justify-center h-[3.75rem] p-2.5 items-center gapx-4 py-3 self-stretch">
                <p
                  key={index}
                  className="text-sm font-poppins font-normal flex-component"
                >
                  {data.reportedBy}
                </p>
              </div>
              <div className="flex justify-center h-[3.75rem] p-2.5 items-center gapx-4 py-3 self-stretch">
                <p
                  key={index}
                  className="text-sm font-poppins font-normal flex-component"
                >
                  {data.reportedOn}
                </p>
              </div>

              <div className="flex justify-center h-12 p-2.5 items-center gapx-4 py-3 ">
                {/* <p key={index} className="text-sm flex-component">
                  {data.actions}
                </p> 
                <img className="gap-1" src={"/Dots.svg"} />
              </div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
}

export default GridFormat;
