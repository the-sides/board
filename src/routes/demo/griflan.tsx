import { createFileRoute } from '@tanstack/react-router'
import '@/styles/griflan.css'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP)

export const Route = createFileRoute('/demo/griflan')({
  component: GriflanPage,
})

function GriflanPage() {
  const lineRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = lineRef.current
    if (!el) return

    const tl = gsap.timeline({ delay: 0.5, defaults: { ease: 'expo.in' } })

    tl.set(el, { width: 0 })
    tl.set('p', { opacity: 0 })
    tl.set('h1', { opacity: 0 })
    tl.to(el, { width: '50vw', duration: 1})
    tl.to('p', { opacity: 1 }, 1)
    tl.to('h1', { opacity: 1 }, 2)
  })

  return (
    <main className="text-amber-100 flex items-center justify-center h-screen">
      <div className="center-wrapper">
        <div className="top text-4xl flex justify-center items-center gap-x-6">
          <p className='opacity-0'>Grif</p>
          <div className="w-[50vw] flex items-center">
          <div ref={lineRef} className="mx-auto w-0 line border-t border-amber-100 opacity-50"></div>
          </div>
          <p className='opacity-0'>lan</p>
        </div>
        <div className="bottom w-full text-center mt-12">
          <h1 className="opacity-0 text-8xl ">Bringing Ideas to Life</h1>
        </div>
      </div>
    </main>
  )
}
