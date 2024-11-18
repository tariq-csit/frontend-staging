import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"


export default function InputCalendar(props: {
  value: Date
  onChange: (date: Date) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={"outline"} 
          className={cn(
            "flex h-10 px-input  justify-start border border-inputBorder rounded-input w-full sm:text-sm lg:text-base",
            !props.value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {props.value ? format(props.value , "PPP") : <span>Pick a start date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar

          mode="single"
          selected={props.value}
          onSelect={(date) => props.onChange(date!)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

