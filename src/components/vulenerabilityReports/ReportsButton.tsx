import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"
import { Button } from '@/components/ui/button'
import NewPentestsForm from "../newPentestsForm/NewPentestsForm"

function ReportsButton() {
  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant='default' className='flex gap-[10px]'>
          <PlusIcon className="h-4 w-4" />
          <span>Add Vulnerabiities</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full sm:w-4/5 sm:max-w-full lg:w-2.5 p-8 flex-col items-start gap-8 rounded-form shrink-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins text-base sm:text-lg lg:text-2xl font-medium capitalize">
            Create new pentest
          </DialogTitle>
        </DialogHeader>

        <NewPentestsForm/>
      </DialogContent>
    </Dialog>
  )
}

export default ReportsButton
