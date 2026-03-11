import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MouseEventHandler, ReactNode } from 'react'

export const Route = createFileRoute('/demo/os-genned')({
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

  return (
    <main className="w-[100dw] h-screen overflow-hidden relative">
      <div className="grid px-1 w-full grid-cols-3 justify-center py-1 bg-neutral-800 text-amber-100 font-mono">
        <a href="/">
          <ArrowLeft className="text-xs scale-75" />
        </a>
        <span className="text-center">{time}</span>
        <span></span>
      </div>
      <img
        src="/wallpaper.png"
        className="select-none w-full h-full object-cover"
        alt="Wallpaper of a gradient"
      />
      <BrowserWindow />
      <FilesWindow />
    </main>
  )
}

type WindowRect = {
  x: number
  y: number
  width: number
  height: number
}

type WindowInteraction =
  | {
      type: 'drag'
      offsetX: number
      offsetY: number
    }
  | {
      type: 'resize'
      startMouseX: number
      startMouseY: number
      startWidth: number
      startHeight: number
    }
  | null

type DesktopWindowProps = {
  title: string
  initialRect: WindowRect
  minWidth?: number
  minHeight?: number
  className?: string
  children: ReactNode
}

function DesktopWindow({
  title,
  initialRect,
  minWidth = 260,
  minHeight = 180,
  className = '',
  children,
}: DesktopWindowProps) {
  const [rect, setRect] = useState(initialRect)
  const interactionRef = useRef<WindowInteraction>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const interaction = interactionRef.current
      if (!interaction) return

      if (interaction.type === 'drag') {
        setRect((prev) => ({
          ...prev,
          x: event.clientX - interaction.offsetX,
          y: event.clientY - interaction.offsetY,
        }))
        return
      }

      const deltaX = event.clientX - interaction.startMouseX
      const deltaY = event.clientY - interaction.startMouseY
      setRect((prev) => ({
        ...prev,
        width: Math.max(minWidth, interaction.startWidth + deltaX),
        height: Math.max(minHeight, interaction.startHeight + deltaY),
      }))
    }

    const onMouseUp = () => {
      interactionRef.current = null
      setIsInteracting(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [minHeight, minWidth])

  const onStartDrag: MouseEventHandler<HTMLDivElement> = (event) => {
    interactionRef.current = {
      type: 'drag',
      offsetX: event.clientX - rect.x,
      offsetY: event.clientY - rect.y,
    }
    setIsInteracting(true)
    event.preventDefault()
  }

  const onStartResize: MouseEventHandler<HTMLButtonElement> = (event) => {
    interactionRef.current = {
      type: 'resize',
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    }
    setIsInteracting(true)
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <section
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
      className={`absolute left-0 top-0 z-10 rounded shadow-lg overflow-hidden border border-black/30 flex flex-col ${className}`}
    >
      <div
        onMouseDown={onStartDrag}
        className={`h-8 px-3 shrink-0 flex items-center bg-neutral-900 text-amber-100 font-mono text-xs select-none ${isInteracting ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {title}
      </div>
      <div className="min-h-0 grow overflow-hidden">{children}</div>
      <button
        type="button"
        onMouseDown={onStartResize}
        aria-label={`Resize ${title}`}
        className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize bg-transparent"
      />
    </section>
  )
}

function BrowserWindow() {
  return (
    <DesktopWindow
      title="Browser"
      initialRect={{ x: 80, y: 140, width: 500, height: 650 }}
      minWidth={340}
      minHeight={320}
      className="bg-neutral-100"
    >
      <iframe
        src="https://jacobsides.com"
        className="h-full w-[calc(100%+15px)]"
        title="jacobsides"
      />
    </DesktopWindow>
  )
}

function FilesWindow() {
  return (
    <DesktopWindow
      title="Home"
      initialRect={{ x: 800, y: 80, width: 520, height: 390 }}
      minWidth={360}
      minHeight={220}
      className="bg-slate-800 text-lime-500"
    >
      <pre className="select-none p-4 text-sm font-mono">
        Permissions Size User Date Modified Name <br />
        drwxr-xr-x - jake 2 Feb 22:09  Desktop <br />
        drwxr-xr-x - jake 11 Feb 09:55 󰲂 Documents <br />
        drwxr-xr-x - jake 12 Feb 20:24 󰉍 Downloads <br />
        drwxr-xr-x - jake 31 Jan 12:13  go <br />
        drwxr-xr-x - jake 29 Jan 14:11 󱍙 Music <br />
        drwxr-xr-x - jake 12 Feb 15:47 󰉏 Pictures <br />
        drwxr-xr-x - jake 29 Jan 14:11  Public <br />
        drwxr-xr-x - jake 8 Feb 21:23  repos <br />
        drwxr-xr-x - jake 8 Feb 22:42  sync <br />
        drwxr-xr-x - jake 29 Jan 14:11  Templates <br />
        drwxr-xr-x - jake 29 Jan 14:11  Videos <br />
        drwxr-xr-x - jake 29 Jan 21:40  Wallpapers <br />
        drwxr-xr-x - jake 29 Jan 14:03  Work <br />
        .rw-r--r-- 309 jake 8 Feb 17:36  worklog.txt <br />
      </pre>
    </DesktopWindow>
  )
}
