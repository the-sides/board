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
    tl.to(el, { width: '50vw', duration: 1 })
    tl.to('p', { opacity: 1 }, 1)
    tl.to('h1', { opacity: 1 }, 2)
  })

  return (
    <main className="text-amber-100 flex items-center justify-center min-h-screen">
      <div className="center-wrapper absolute inset-0 m-auto flex items-center justify-center flex-col">
        <div className="top text-4xl flex justify-center items-center gap-x-6">
          <p className='opacity-0'>Grif</p>
          <div className="w-[50vw] flex items-center">
            <div ref={lineRef} className="mx-auto w-0 line border-t border-amber-100 opacity-50"></div>
          </div>
          <p className='opacity-0'>lan</p>
        </div>
      </div>
      <div className="bottom w-full text-center pt-48">
        <h1 className="opacity-0 text-4xl max-w-screen-md mx-auto"><span>Bringing</span> <span className="opacity-0"> details together to formulate</span> <span className="">Ideas</span> <span className="opacity-0">that communicate your brand</span> <span className="">to</span> <span className="opacity-0">the customers that bring your company</span> <span className="">Life</span></h1>
      </div>
    </main>
  )
}
