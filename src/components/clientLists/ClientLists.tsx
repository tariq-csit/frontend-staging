import List from "./List"
function ClientLists() {
  return (
    <div className="flex px-5 sm:px-10 flex-col items-start gap-6 self-stretch">
      <div className="flex p-6 flex-col items-start gap-6 self-stretch rounded-activity bg-white shadow-6 overflow-x-scroll">
        <h3 className="self-stretch text-[#030229] font-poppins text-2xl font-medium">Client Lists</h3>
        <List/>
      </div>
    </div>
  )
}

export default ClientLists
