import { PlusIcon } from "lucide-react"

function ReportsButton(props: {
  setForm: Function
}) {
  return (
        <button className='sm:w-1/2 self-stretch rounded-lg border border-dashed border-primary-900 bg-primary-900/20 flex justify-center items-center min-h-60' onClick={()=>props.setForm(true)}>
          <div className="flex items-center gap-[10px]">
          <PlusIcon className="h-6 w-6" />
          <span className="text-2xl text-primary-900">Add Vulnerabiities</span>
          </div>
        </button>
  )
}

export default ReportsButton
