
function ListFormat() {
  return (
    <div className="grid grid-cols-3 gap-component w-full">
      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
        <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#5030E5]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">Open Bugs</h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full"><span className="text-xs font-inter text-[#625F6D] font-medium ">4</span></div>
          </div>
        <div className="flex h-0 self-stretch border border-[#5030E5]"></div>
        </div>
      </div>


      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
      <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#FFA500]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">In Progress Fixes</h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full"><span className="text-xs font-inter text-[#625F6D] font-medium ">3</span></div>
          </div>
        <div className="flex h-0 self-stretch border border-[#FFA500]"></div>
        </div>
      </div>


      <div className="flex p-5 flex-col items-start gap-6 flex-component rounded-component bg-[#F5F5F5]">
      <div className="flex flex-col items-start gap-component self-stretch">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#5030E5]"></div>
            <h3 className="font-inter text-[#0D062D] font-medium">Open Bugs</h3>
            <div className=" flex justify-center items-center w-5 h-5 shrink-0 bg-[#E0E0E0] rounded-full"><span className="text-xs font-inter text-[#625F6D] font-medium ">4</span></div>
          </div>
        <div className="flex h-0 self-stretch border border-[#5030E5]"></div>
        </div>
      </div>
      
    </div>
  )
}

export default ListFormat
