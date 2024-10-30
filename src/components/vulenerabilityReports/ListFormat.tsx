import ReportsCard from "./ReportsCard";

function ListFormat() {
  const openBugs=[
    {
      priority: 'low',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
    {
      priority: 'low',
      title: 'Research',
      description: "User research helps you to create an optimal product for users.",
      comments: 10,
      files: 3
    },
    {
      priority: 'high',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
    {
      priority: 'critical',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
  ]
  const inProgressBugs=[
    {
      priority: 'low',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
    {
      priority: 'low',
      title: 'Research',
      description: "User research helps you to create an optimal product for users.",
      comments: 10,
      files: 3
    },
    {
      priority: 'high',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
  ]
  const ResolvedBugs=[
    {
      priority: 'completed',
      title: 'Brainstorming',
      description: "Brainstorming brings team members' diverse experience into play.",
      comments: 12,
      files: 0
    },
    {
      priority: 'completed',
      title: 'Research',
      description: "User research helps you to create an optimal product for users.",
      comments: 10,
      files: 3
    },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-component w-full">
      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
        <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#5030E5]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">Open Bugs</h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full">
              <span className="text-xs font-inter text-[#625F6D] font-medium ">
                {openBugs.length}
              </span>
            </div>
          </div>
          <div className="flex h-0 self-stretch border border-[#5030E5]"></div>
        </div>
        {
          openBugs.map((card, i)=>{
            return<ReportsCard key={i} priority={card.priority} title={card.title} description={card.description} comments={card.comments} files={card.files}/>
          })
        }
      </div>

      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
        <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#FFA500]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">
              In Progress Fixes
            </h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full">
              <span className="text-xs font-inter text-[#625F6D] font-medium ">
                {inProgressBugs.length}
              </span>
            </div>
          </div>
          <div className="flex h-0 self-stretch border border-[#FFA500]"></div>
        </div>
        {
          inProgressBugs.map((card, i)=>{
            return<ReportsCard key={i} priority={card.priority} title={card.title} description={card.description} comments={card.comments} files={card.files}/>
          })
        }
      </div>

      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
        <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#76A5EA]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">Resolved</h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full">
              <span className="text-xs font-inter text-[#625F6D] font-medium ">
                {ResolvedBugs.length}
              </span>
            </div>
          </div>
          <div className="flex h-0 self-stretch border border-[#76A5EA]"></div>
        </div>
      
      {
          ResolvedBugs.map((card, i)=>{
            return<ReportsCard key={i} priority={card.priority} title={card.title} description={card.description} comments={card.comments} files={card.files}/>
          })
        }
        </div> 
    </div>
  );
}

export default ListFormat;
