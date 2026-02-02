import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/demo/eyes')({
  component: RouteComponent,
})

function RouteComponent() {
  const rel = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const watchMouse = (e: MouseEvent) => {
    console.log(e)
    const x = e.clientX - (window.innerWidth * 0.5)
    const y = e.clientY - (window.innerHeight * 0.5)
    if (!rel[0].current || !rel[1].current) return;
    // rel.current.lastChild?.normalize
    rel[0].current.style.transform = `translate(${-x * 0.1}px, ${-y * 0.1}px)`
    rel[1].current.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`
    // rel.current.style.display = `none`
  }
  useEffect(() => {
    if (window && rel[1].current) {
      window.addEventListener('mousemove', watchMouse)
      return () => window.removeEventListener('mousemove', watchMouse)
    }
  })
  return <div className='min-h-[calc(100vh-72px)] bg-teal-900 flex gap-1 items-center justify-center'>
    {[1, 2].map((_, i) => {
      return <div key={i} className='h-24 w-18 bg-white border border-black rounded-full sdcale-y-125 flex'>
        <div ref={rel[i]} className='bg-black m-auto rounded-full h-5 w-5'></div>

      </div>
    })}
  </div>
}
