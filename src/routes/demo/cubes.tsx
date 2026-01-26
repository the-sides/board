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
  const cubesY = 12;
  const a = 120;
  const b = 120;
  const c = Math.sqrt(a ** 2 + b ** 2)
  const message = ['Never', 'stop', 'creating']

  
  return (
    <main className='flex flex-col items-start justify-start min-h-screen p-4 text-white overflow-hidden' style={{
      backgroundColor: '#2BE6BE',
      backgroundImage:
        'linear-gradient(315deg, #2BE6BE, #0B0C22)',
    }}>
      {new Array(cubesY).fill(0).map((_, y) => <div
        className="row flex items-start justify-start gap-x-12 -ml-20"
        style={{ transform: `translate(${c / 2 * (y % 2)}px, ${0 * y}px)` }}
      >
        {new Array(cubesX).fill(0).map((_, x) => {
          return <div data-letter={message[y]?.[x]?? ''} className="cube"><div className="px-1 z-10 relative"></div></div>
        })}
      </div>)
      }

    </main>
  )
}
