import { Head } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import cs from './index.module.css'
import { Button } from '@/components/ui/button'
import { i18n_t } from '@/lib/utils'

export default function InertiaExample() {
  const { i18n, green_text } = usePage().props
  return (
    <div className={cs.root}>
      <Head title="Ruby on Rails + Inertia + React" />

      <div>
        <Button className="text-green-500">dynamic: {i18n_t(i18n, "pages.inertia_example.green_text")}</Button>
        <Button className="text-green-500">static: {green_text}</Button>

      </div>
    </div>
  )
}
