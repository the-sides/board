import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/demo/os')({
  component: RouteComponent,
})


function RouteComponent() {
  const [time, setTime] = useState(new Date().toISOString().split('T')[1].split('.')[0])
  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date().toISOString().split('T')[1].split('.')[0]
      setTime(now)
    }, 1000)
    return () => clearInterval(int)
  }, [])
  return (
    <main className='w-[100dw] h-screen overflow-hidden'>
      <div className='flex justify-center py-1 bg-neutral-800 text-amber-100 font-mono'>{time}</div>
      <img src="/wallpaper.png" className='w-full h-full object-cover' alt="Wallpaper of a gradient" srcset="" />
      
    </main>
  )
}
