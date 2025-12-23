import { Head, Link } from '@inertiajs/react'

import cs from './index.module.css'
import { Button } from '@/components/ui/button'
import { NavBar } from '@/components/nav-bar'
import type { PageProps } from '@/types'

export default function InertiaExample({ auth }: PageProps) {
  return (
    <div className={cs.root}>
      <Head title="Ruby on Rails + Inertia + React" />

      <NavBar />

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">
            Ruby on Rails + Inertia + React
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            SSR-ready starter with WorkOS auth wiring.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {auth ? (
              <>
                <span className="text-sm text-foreground">
                  Signed in as {auth.first_name} {auth.last_name} ({auth.email})
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/logout" method="delete" as="button">
                    Sign out
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <a href="/auth/login">Sign in with WorkOS</a>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
