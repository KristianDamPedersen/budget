"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./field"


export type DatePickerProps = {
  label: string
  onDateChange: (date: Date | undefined) => void
}
export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const { label, onDateChange } = props
  const [date, setDate] = React.useState<Date | undefined>(new Date(Date.now()))


  React.useEffect(() => {
    onDateChange(date)
  }, [date])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>

      </Field>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover >
  )
}
