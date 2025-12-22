// app/frontend/entrypoints/inertia.ts
import { ThemeProvider } from '@/components/providers/theme-provider'
import { createInertiaApp } from '@inertiajs/react'
import { createElement, ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// Temporary type definition, until @inertiajs/react provides one
type ResolvedComponent = {
  default: ReactNode
  layout?: (page: ReactNode) => ReactNode
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('../pages/**/*.tsx', {
      eager: true,
    })
    const page = pages[`../pages/${name}.tsx`]
    if (!page) {
      console.error(`Missing Inertia page component: '${name}.tsx'`)
    }
    return page
  },

  setup({ el, App, props }) {
    if (!el) {
      console.error(
        'Missing root element.\n\n' +
        'If you see this error, it probably means you load Inertia.js on non-Inertia pages.\n' +
        'Consider moving <%= vite_typescript_tag "inertia" %> to the Inertia-specific layout instead.',
      )
      return
    }

    const app = createElement(App, props)

    const appWithContext = (<>
      <ThemeProvider>
        {app}
      </ThemeProvider>
    </>)
    // Prefer using the dedicated flag if present:
    // Inertia-Rails adds data-server-rendered="true" on SSR roots.
    const isServerRendered =
      (el as HTMLElement).dataset.serverRendered === 'true' || el.hasChildNodes()

    if (isServerRendered) {
      // Hydrate only when we actually have SSR markup
      hydrateRoot(el, appWithContext)
    } else {
      // Plain client-side render
      createRoot(el).render(appWithContext)
    }
  },
})

