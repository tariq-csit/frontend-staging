import { PlusIcon } from "lucide-react"
import { Button } from '@/components/ui/button'

function ReportsButton(props: {
  setForm: Function
}) {
  return (
        <Button variant='default' className='flex gap-[10px]' onClick={()=>props.setForm(true)}>
          <PlusIcon className="h-4 w-4" />
          <span>Add Vulnerabiities</span>
        </Button>
  )
}

export default ReportsButton
