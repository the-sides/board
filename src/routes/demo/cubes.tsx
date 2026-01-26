import { useQuery } from '@tanstack/react-query'

import { createFileRoute } from '@tanstack/react-router'

function getNames() {
  return fetch('/demo/api/names').then((res) => res.json() as Promise<string[]>)
}

export const Route = createFileRoute('/demo/cubes')({
  component: Home,
})

function Home() {
  const cubesX = 9
  const cubesY = 5;

  return (
    <main className='flex flex-col items-center justify-center min-h-screen p-4 text-white' style={{
      backgroundColor: '#000',
      backgroundImage:
        'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
    }}>
      <div
        className="flex px-8 py-36 overflow-hidden items-start justify-start gap-12 gap-y-17"

      >
        {new Array(cubesX).fill(0).map((_, x) => {
          return <div className="cube"><div className="px-1">{x}</div></div>
        })}
      </div>

      
    </main>
  )
}
