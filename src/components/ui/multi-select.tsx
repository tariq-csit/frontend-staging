"use client"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

type Option = {
  id: string
  label?: string
  value: string
  getIsVisible: () => boolean
  toggleVisibility: (value: boolean) => void
}

interface MultiSelectProps {
  options: Option[]
  buttonLabel?: string
  onChange: (value: string[]) => void
  value: string[]
}

export function MultiSelect({
  options,
  buttonLabel = "Select",
  onChange,
  value,
}: MultiSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          {buttonLabel} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            className="w-full capitalize"
            checked={value.includes(option.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...value, option.id]);
              } else {
                onChange(value.filter((id) => id !== option.id));
              }
            }}
          >
            {option.label || option.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
