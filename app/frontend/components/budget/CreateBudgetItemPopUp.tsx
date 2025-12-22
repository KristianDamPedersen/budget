
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
import { BudgetCategory } from "@/pages/budget/create"
import { Select, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"
import { SelectContent } from "../ui/select"
import { DraggableTreeItem } from "../Draggable-tree"

export type CreateBudgetItemPopUpProps = {
  i18n: I18nNode
  categories: DraggableTreeItem[]
}
export function CreateBudgetItemPopUp(Props: CreateBudgetItemPopUpProps) {
  const { i18n, categories } = Props;
  const i18n_prefix = "components.create_budget_item_popup."
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">{i18n_t(i18n, "common.create")}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{i18n_t(i18n, i18n_prefix + 'title')}</DialogTitle>
            <DialogDescription>{i18n_t(i18n, i18n_prefix + 'description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">{i18n_t(i18n, 'common.name')}</Label>
              <Input id="name" name="name" defaultValue={i18n_t(i18n, "common.name")} />
            </div>
            <div>
              <Label htmlFor="category">{i18n_t(i18n, 'entities.category.label')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={`${i18n_t(i18n, 'common.select')} ${i18n_t(i18n, 'entities.category.label')}`}></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat =>
                    <SelectItem value={cat.id.toString()}>{cat.name}</SelectItem>
                  )}

                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
