import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/demo/time-sliders')({
  component: RouteComponent,
})

type SliderProps = {
  cap: number
  y: number
}
function Slider({ cap, y }: SliderProps) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `translateY(${y * 32}px)` }}
    >
      hello{' '}
      {Array.from({ length: cap }, (_, i) => (
        <div key={i} className="w-8 h-8 bg-white">{i}</div>
      ))}
    </div>
  )
}

function RouteComponent() {
  const [time, setTime] = useState(new Date().toTimeString())
  const [h, setH] = useState(0)
  const [m, setM] = useState(0)
  const [s, setS] = useState(0)
  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date().toISOString().split('T')[1].split('.')[0]
      const [_h, _m, _s] = now.split(':').map(Number)
      setH(_h)
      setM(_m)
      setS(_s)
      setTime(now)
    }, 1000)
    return () => clearInterval(int)
  }, [])
  return (
    <>
      <div>{time}</div>
      <div className="min-h-[calc(100vh-72px)] bg-teal-900 flex gap-1 items-center justify-center">
        <p className="text-3xl text-white">
          {h} {m} {s}
        </p>
      </div>
      <div className="flex justify-center items-center">
        <Slider cap={12} y={1} />
      </div>
    </>
  )
}
