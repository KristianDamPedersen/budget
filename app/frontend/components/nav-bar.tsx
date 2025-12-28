import { usePage, Link } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import type { SharedProps } from '@/types'

export function NavBar() {
  const { props } = usePage<{ auth?: SharedProps['auth'] }>()
  const user = props.auth

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {!user ? (
          <Link href="/" className="text-sm font-semibold text-foreground">
            Home
          </Link>
        ) : (
          < Link href="/budget" className="text-sm font-semibold text-foreground">
            Budget
          </Link>
        )}

        < div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.first_name} {user.last_name}
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
    </header >
  )
}
