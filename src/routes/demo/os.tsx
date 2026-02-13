import { createFileRoute } from '@tanstack/react-router'
import { ArrowBigLeft, ArrowLeft, ArrowLeftCircle, ArrowLeftFromLine, ArrowLeftIcon, ArrowLeftRightIcon } from 'lucide-react'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/demo/os')({
  component: RouteComponent,
})

function RouteComponent() {
  const [time, setTime] = useState(
    new Date().toISOString().split('T')[1].split('.')[0],
  )
  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date().toISOString().split('T')[1].split('.')[0]
      setTime(now)
    }, 1000)
    return () => clearInterval(int)
  }, [])
  const windowRef = useRef<HTMLDivElement | null>(null)
  const isMouseDown = useRef(false)
  const mouseDiff = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const x0 = useRef(-1)
  const y0 = useRef(-1)

  const onGrab: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!windowRef.current) return false
    isMouseDown.current = true

    x0.current = Number(windowRef.current.dataset.x)
    y0.current = Number(windowRef.current.dataset.y)

    mouseDiff.current = { x: e.clientX - x0.current, y: e.clientY - y0.current }
  }

  const onRelease: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!windowRef.current) return false
    isMouseDown.current = false
  }

  const onMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!windowRef.current) return
    // Are we dragging?
    if (!isMouseDown.current || !mouseDiff.current.x || !mouseDiff.current.y)
      return
    // x0.current = e.clientX
    // y0.current = e.clientY

    // log(JSON.stringify({ x }))
    const newX = e.clientX - mouseDiff.current.x
    const newY = e.clientY - mouseDiff.current.y
    windowRef.current.dataset.x = String(newX)
    windowRef.current.dataset.y = String(newY)
    windowRef.current.style.transform = `translate(${newX}px, ${newY}px)`
  }

  return (
    <main
      onMouseMove={onMove}
      className="w-[100dw] h-screen overflow-hidden relative"
    >
      <div className="grid px-1 w-full grid-cols-3 justify-center py-1 bg-neutral-800 text-amber-100 font-mono">
        <a href="/"><ArrowLeft className='text-xs scale-75'/></a>
        <span className='text-center'>
        {time}
        </span>
        <span>
        </span>
      </div>
      <img
        src="/wallpaper.png"
        className="select-none w-full h-full object-cover"
        alt="Wallpaper of a gradient"
      />
      <div
        ref={windowRef}
        onMouseDown={onGrab}
        data-x="200"
        data-y="80"
        style={{
          transform: `translate(200px, 80px)`,
        }}
        onMouseUp={onRelease}
        className="cursor-grab rounded font-mono p-4 text-sm text-lime-500 absolute z-10 left-[0] top-[0] shadow-lg w-1/3 h-1/3 opacity-80 bg-slate-800"
      >
        <pre className=''>
          Permissions Size User Date Modified Name <br/>
          drwxr-xr-x     - jake  2 Feb 22:09   Desktop <br/>
          drwxr-xr-x     - jake 11 Feb 09:55  󰲂 Documents <br/>
          drwxr-xr-x     - jake 12 Feb 20:24  󰉍 Downloads <br/>
          drwxr-xr-x     - jake 31 Jan 12:13   go <br/>
          drwxr-xr-x     - jake 29 Jan 14:11  󱍙 Music <br/>
          drwxr-xr-x     - jake 12 Feb 15:47  󰉏 Pictures <br/>
          drwxr-xr-x     - jake 29 Jan 14:11   Public <br/>
          drwxr-xr-x     - jake  8 Feb 21:23   repos <br/>
          drwxr-xr-x     - jake  8 Feb 22:42   sync <br/>
          drwxr-xr-x     - jake 29 Jan 14:11   Templates <br/>
          drwxr-xr-x     - jake 29 Jan 14:11   Videos <br/>
          drwxr-xr-x     - jake 29 Jan 21:40   Wallpapers <br/>
          drwxr-xr-x     - jake 29 Jan 14:03   Work <br/>
          .rw-r--r--   309 jake  8 Feb 17:36   worklog.txt <br/>
        </pre>
      </div>
      
    </main>
  )
}
