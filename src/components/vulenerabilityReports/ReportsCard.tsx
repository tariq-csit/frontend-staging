function ReportsCard(props: {
  priority: string;
  title: string;
  description: string;
  comments: number;
  files: number;
}) {
  return (
    <div className="flex flex-col p-5 items-start gap-8 self-stretch bg-white rounded-component">
      <div className="flex flex-col gap-1 items-start self-stretch">
        <div className="flex justify-between items-center self-stretch">
          <div
            className={`flex w-9 h-[1.4375rem] py-1 px-[0.375rem] justify-center items-center gap-nav rounded-chart 
        ${props.priority === "low" && "bg-[#DFA87433]"}
        ${props.priority === "high" && "bg-[#D8727D1A]"}
        ${props.priority === "critical" && "bg-[#D5494933] w-[3.25744rem]"}
        ${props.priority === "completed" && "bg-[#83C29D33] w-[4.75rem]"}`}
          >
            <p
              className={`font-inter text-xs font-medium capitalize
          ${props.priority === "low" && "text-[#D58D49]"}
          ${props.priority === "high" && "text-[#D8727D]"}
          ${props.priority === "critical" && "text-[#D54949]"}
          ${props.priority === "completed" && "text-[#68B266]"}
          `}
            >
              {props.priority}
            </p>
          </div>
          <div className="flex w-4  flex-col justify-center shrink-0 text-[#0D062D] font-inter font-extrabold tracking-[-0.07rem] ">
            ...
          </div>
        </div>

          <div className="flex flex-col items-start gap-1 self-stretch">
            <h1 className="self-stretch text-[#0D062D] font-poppins text-lg font-semibold">
              {props.title}
            </h1>
            <p className="self-stretch text-inputBorder font-poppins text-xs font-normal ">
              {props.description}
            </p>
          </div>  
      </div>
        <div className="flex justify-between items-center self-stretch text-inputBorder">
          <div className="flex items-center gap-[-0.375rem]">
            <img className="w-6 h-6 -ml-2 border rounded-full border-white" src="/Ellipse 6.svg" />
            <img className="w-6 h-6 -ml-2 border rounded-full border-white" src="/Ellipse 6.svg" />
            <img className="w-6 h-6 -ml-2 border rounded-full border-white" src="/Ellipse 6.svg" />
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-1">
              <img src="/message.svg" />
              <span className="text-inputBorder font-poppins text-xs font-medium ">{props.comments} comments</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1">
              <img src="/folder-2.svg" />
              <span className="text-inputBorder font-poppins text-xs font-medium ">{props.files} files</span>
            </div>
          </div>
        </div>
    </div>
  );
}

export default ReportsCard;
