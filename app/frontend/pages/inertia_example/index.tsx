import { Head } from '@inertiajs/react'

import cs from './index.module.css'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default function InertiaExample() {
  return (
    <div className={cs.root}>
      <Head title="Ruby on Rails + Inertia + React" />
      <ModeToggle></ModeToggle>
      <div>
        <Button> From ShadCn tailwind styled</Button>
      </div>
    </div>
  )
}
