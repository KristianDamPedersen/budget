
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { i18n_t, I18nNode } from "@/lib/utils"
import { SelectContent, Select, SelectTrigger, SelectValue, SelectItem } from "../ui/select"
import { DraggableTreeItem } from "../Draggable-tree"
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field"
import { BudgetCategory } from "@/pages/budget/create"
import { DatePicker } from "../ui/datepicker"
import { useState } from "react"
import { CurrencyInput } from "../ui/InputWithCurrency"
import { BudgetItem } from "@/types/budget/BudgetItem"

export type CreateBudgetItemPopUpProps = {
  i18n: I18nNode
  categories: BudgetCategory[]
  itemTypes: string[]
  cadenceTypes: string[]
  onSubmit: (item: BudgetItem) => void
}
export function CreateBudgetItemPopUp(Props: CreateBudgetItemPopUpProps) {


  const { i18n, categories, itemTypes, cadenceTypes, onSubmit } = Props;
  const [firstOccurence, setFirstOccurence] = useState<Date>(new Date(Date.now()))
  const [name, setName] = useState<string>("")
  const [selectedcategory, setselectedcategory] = useState<string | number>('')
  const [itemType, setItemType] = useState<string>(itemTypes[0])
  const [cadence, setCadence] = useState<string>(cadenceTypes[0])
  const [value, setValue] = useState<number>(0)
  function handleSubmit(e) {
    e.preventDefault()
    var item: BudgetItem = {
      budget_id: "not set yet",
      name: name,
      created_by: "some rando",
      category_id: selectedcategory,
      item_type: itemType,
      cadence: cadence,
      value: value,
      currency: "dkk",
      first_occurence: firstOccurence,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now())
    }
    console.log(item)
    onSubmit(item)
  }
  const i18n_prefix = "components.create_budget_item_popup."
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{i18n_t(i18n, "common.create")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{i18n_t(i18n, i18n_prefix + 'title')}</DialogTitle>
          <DialogDescription>{i18n_t(i18n, i18n_prefix + 'description')}</DialogDescription>
        </DialogHeader>
        { /* Name of the budget item */}
        <FieldGroup className="grid gap-4">
          <FieldLabel>{i18n_t(i18n, 'common.name')}</FieldLabel>
          <Input
            id="name"
            name="name"
            onChange={(e) => setName(e.target.value)}
            defaultValue={i18n_t(i18n, "common.name")} />
        </FieldGroup >

        {/* The category of the budget item */}
        <Field>
          <FieldLabel>{i18n_t(i18n, 'entities.category.label')}</FieldLabel>
          <Select
            onValueChange={e => setselectedcategory(e)}>
            <SelectTrigger>
              <SelectValue
                placeholder={`${i18n_t(i18n, 'common.select')} ${i18n_t(i18n, 'entities.category.label')}`}
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat =>
                <SelectItem value={cat.id.toString()}>{cat.name}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </Field>

        {/*The type of the budget item */}
        <Field>
          <FieldLabel>{i18n_t(i18n, "entities.budget_item.type")}</FieldLabel>
          <Select
            onValueChange={e => setItemType(e)}>
            <SelectTrigger>
              <SelectValue placeholder={`${i18n_t(i18n, 'common.select')} ${i18n_t(i18n, 'entities.category.label')}`}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {itemTypes.map(t =>
                <SelectItem value={t}>{t}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </Field>

        {/* Input for the cadence */}
        <Field>
          <FieldLabel>{i18n_t(i18n, "entities.budget_item.cadence")}</FieldLabel>
          <Select
            onValueChange={e => setCadence(e)}>
            <SelectTrigger>
              <SelectValue placeholder={`${i18n_t(i18n, 'common.select')} ${i18n_t(i18n, 'entities.category.label')}`}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cadenceTypes.map((c: string) =>
                <SelectItem value={c}>{c}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </Field>

        {/* First occurence */}
        <DatePicker
          label={i18n_t(i18n, "entities.budget_item.first_occurence")}
          onDateChange={(val) => {
            if (val != undefined) {
              setFirstOccurence(val)
            }
          }}
        />
        {/* Amount */}
        <CurrencyInput
          onInputValueChange={(val) => {
            if (val != undefined) {
              setValue(val)
            }
          }
          }
          localizedCurrency={i18n_t(i18n, "common.default_local_currency")}
          localizedMutedText={i18n_t(i18n, "components.currency_input.muted_text")}
          localizedLabel={i18n_t(i18n, "components.currency_input.label")}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{i18n_t(i18n, "common.cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>{i18n_t(i18n, "common.save")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
