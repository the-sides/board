import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import ConvexProvider from '../integrations/convex/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const hideHeader =
    location.pathname === '/demo/os' || location.pathname === '/demo/griflan'

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          {!hideHeader && <Header />}
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-24 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
          404
        </p>
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight">
            That page does not exist.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300">
            The route was not found. Head back to the demo index and pick an
            existing page.
          </p>
        </div>
        <Link
          to="/"
          className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20"
        >
          Return home
        </Link>
      </div>
    </main>
  )
}
