
"use client";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "./field";
import { Label } from "./label";

export type CurrencyInputProps = {
  localizedMutedText: string
  localizedLabel: string
  onInputValueChange: (value: number | undefined) => void
}
export function CurrencyInput(Props: CurrencyInputProps) {
  const { onInputValueChange, localizedLabel, localizedMutedText } = Props

  function handleinput(e) {
    let parsed = Number.parseFloat(e.target.value)
    if (!Number.isNaN(parsed)) {
      onInputValueChange(parsed)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="currency-input">{localizedLabel}</Label>
      <div className="relative">
        <Input
          className="bg-background pl-9"
          onChange={handleinput}
          id="currency-input"
          min="0"
          placeholder="0.00"
          step="0.01"
          type="number"
        />

        <p className="absolute top-1.5 right-1/4 h-4 w-4 text-muted-foreground">dkk</p>
      </div>
      <p className="text-muted-foreground text-xs">{localizedMutedText}</p>
    </div>
  )

}

