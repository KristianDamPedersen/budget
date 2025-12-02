import { Head } from '@inertiajs/react'

import cs from './index.module.css'
import { Button } from '@/components/ui/button'

export default function InertiaExample() {
  return (
    <div className={cs.root}>
      <Head title="Ruby on Rails + Inertia + React" />

      <div>
        <Button className="text-green-500">From ShadCn tailwind styled</Button>
      </div>
    </div>
  )
}
