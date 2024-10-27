import React from 'react'
import PentesterList from '../activePentests/subComponenets/PentesterList'

function GridFormat() {
  const listHead = [{header: "Title",},{header: "Priority",},{header: "Status",},{header: "Description",},{header: "Comments",},{header: "Reported By",},{header: 'Reported On',},{header: "Team Members",},{header: 'Actions'}];
  let listData = [
    {
      title: "Brainstorming",
      priority: 'critical',
      description: "Brainstorming brings team members' diverse...",
      comments: 12,
      reportedBy: 'Jonathan',
      requested: "16/08/2013",
      status: "Complete",
      team: 40,
      actions: 40,
      background: "white",
    },
    {
      title: "Brainstorming",
      priority: 'critical',
      description: "Brainstorming brings team members' diverse...",
      comments: 12,
      reportedBy: 'Jonathan',
      requested: "16/08/2013",
      status: "Complete",
      team: 40,
      actions: "...",
      background: "listBg",
    },
    {
      title: "Brainstorming",
      priority: 'critical',
      description: "Brainstorming brings team members' diverse...",
      comments: 12,
      reportedBy: 'Jonathan',
      requested: "16/08/2013",
      status: "On Going",
      team: 40,
      actions: "...",
      background: "white/80",
    },
    {
      title: "Brainstorming",
      priority: 'critical',
      description: "Brainstorming brings team members' diverse...",
      comments: 12,
      reportedBy: 'Jonathan',
      requested: "16/08/2013",
      status: "Not Started",
      team: 40,
      actions: "...",
      background: "listBg",
    }
  ];
  return (
    <div className="flex flex-col overflow-x-auto justify-between gap-component w-full ">
      

      <div className="flex flex-col p-0 m-0 min-w-[1000px]">
        <div className={`grid grid-cols-9 place-items-start rounded-[0.5rem] bg-white/80 border gap-0`}>
          {listHead.map((data, index) => {
            return (
              <div key={index} className="flex justify-center h-tableVarients p-listItem items-center self-stretch">
                <p key={index} className="text-sm font-poppins flex-component">
                  {data.header}
                </p>
              </div>
            );
          })}
        </div>

        {listData.map((data, index) => {
          return (
            <div key={index} className={`grid grid-cols-9 place-items-start bg-white/80 border  gap-0`}>
              <div className="flex justify-center h-tableVarients p-listItem items-center gap-nav self-stretch">
                <p key={index} className="text-sm font-poppins flex-component text-primary-900">
                  {data.title}
                </p>
              </div>
              <div className="flex justify-center h-tableVarients p-listItem items-center gap-nav self-stretch">
              <div
            className={`flex w-9 h-[1.4375rem] py-1 px-[0.375rem] justify-center items-center gap-nav rounded-chart 
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
          <div className="flex justify-center h-tableVarients p-listItem items-center gap-nav self-stretch">
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
                      ${data.status === "Not Started" && "text-statusTextSilver"}`}
                  >
                    {data.status}
                  </p>
                </div>
              </div>
              <div className="flex justify-center h-[3.75rem] p-listItem items-center gap-nav self-stretch">
               <p key={index} className="text-xs font-poppins font-normal flex-component">
              {data.description}
            </p>
              </div>
              
              <div className="flex justify-center h-[3.75rem] p-listItem items-center gap-nav self-stretch">
               <p key={index} className="text-sm font-poppins font-normal flex-component">
              {data.comments}
            </p>
              </div>
              <div className="flex justify-center h-[3.75rem] p-listItem items-center gap-nav self-stretch">
               <p key={index} className="text-sm font-poppins font-normal flex-component">
              {data.reportedBy}
            </p>
              </div>
              <div className="flex justify-center h-[3.75rem] p-listItem items-center gap-nav self-stretch">
               <p key={index} className="text-sm font-poppins font-normal flex-component">
              {data.requested}
            </p>
              </div>
              <div className="flex justify-center h-tableVarients p-listItem items-center gap-nav self-stretch">
                {/* <p key={index} className="text-sm flex-component">
                  {data.team}
                </p> */}
                <div className="flex items-center gap-teamIcons flex-component">
                  <img className="w-team h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <img className="w-team -ml-9 h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <img className="w-team -ml-9 h-team rounded-full border border-white" src={'/Ellipse 6.svg'} />
                  <div className={`flex justify-center items-center w-team -ml-9 h-team rounded-full bg-primary-900 border border-white`}>
                    <p className="text-2xs font-poppins font-normal text-white">{`+${data.team}`}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center h-tableVarients p-listItem items-center gap-nav ">
                {/* <p key={index} className="text-sm flex-component">
                  {data.actions}
                </p> */}
                <img className="gap-1" src={'/Dots.svg'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default GridFormat
