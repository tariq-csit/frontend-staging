function GridFormat() {
  // const listHead = [
  //   { header: "Title" },
  //   { header: "Priority" },
  //   { header: "Status" },
  //   { header: "Reported By" },
  //   { header: "Reported On" },
  // ];
  const reportsData = [
    {
      name: "Brainstorming",
      priority: "High",
      status: "Open",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    {
      name: "Brainstorming",
      priority: "High",
      status: "Resolved",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    {
      name: "Brainstorming",
      priority: "High",
      status: "In Progress",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    {
      name: "Brainstorming",
      priority: "Low",
      status: "Resolved",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    {
      name: "Brainstorming",
      priority: "High",
      status: "Resolved",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    {
      name: "Brainstorming",
      priority: "High",
      status: "Resolved",
      reportedBy: "Hisham",
      reportedOn: "7th June, 2024",
    },
    
  ];
  return (
    <div className="flex flex-col overflow-x-auto justify-between gap-6 w-full font-poppins">
      <div className="flex flex-col gap-4 min-w-[1000px]">
        {reportsData.map((data,i)=>{
          return(
          <div key={i} className="border-inputBorder p-4 flex justify-between items-center border rounded-md">
            <div className="flex gap-10">
              <div className="flex flex-col gap-1 min-w-64">
                <span className="text-sm text-muted-foreground">Name</span>
                <p className="font-medium">{data.name}</p>
              </div>

              <div className="flex gap-8 min-w-[224px]">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <div
                    className={`flex px-4 justify-center items-center py-1 rounded-[8px] 
                      ${data.priority === "Low" && "bg-priorityBlue"}
                      ${data.priority === "High" && "bg-priorityRed"}`}
                  >
                    <p
                      className={`font-inter text-sm capitalize
                        ${data.priority === "Low" && "text-priorityTextBlue"}
                        ${data.priority === "High" && "text-priorityTextRed"}
                        `}
                    >
                      {data.priority}
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
                  <p className="font-medium">{data.reportedBy}</p>       
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Reported on</span>
                <p className="font-medium">{data.reportedOn}</p>               
                </div>
              </div>
            </div>

            <span className="text-primary-900 text-sm">View details</span>
          </div>
        )})}


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
