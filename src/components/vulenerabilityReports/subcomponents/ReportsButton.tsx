import { PlusIcon } from "lucide-react"

import { useNavigate } from "react-router-dom";

function ReportsButton({ pentestId }: { pentestId: string }) {
  const navigate = useNavigate();

  function handleClick() {
    if (!pentestId) {
      return
    }
    navigate(`/dashboard/vulnerability-reports/${pentestId}/create`)
  }

  return (
        <button className='sm:w-1/2 self-stretch rounded-lg border border-dashed border-primary-900 bg-primary-900/20 flex justify-center items-center min-h-60' onClick={handleClick}>
          <div className="flex items-center gap-[10px]">
          <PlusIcon className="h-6 w-6" />
          <span className="text-2xl text-primary-900">Add Vulnerabilities</span>
          </div>
        </button>
  )
}

export default ReportsButton
