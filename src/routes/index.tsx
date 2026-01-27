import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
  Box,
  BookOpen,
  Palette,
  Timer,
  Video,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const features = [
    {
      icon: <Box className="w-12 h-12 text-cyan-400" />,
      title: 'Winter Steps',
      href: '/demo/cubes',
      description:
        'Winter-themed isometric cubes. Maybe one day it\'ll snow.',
      madeBy: 'hand' as const,
    },
    {
      icon: <BookOpen className="w-12 h-12 text-cyan-400" />,
      title: 'Notebook',
      href: '/demo/notebook',
      description:
        'Real-time collaborative notebook with rich text editing. Powered by Convex and Tiptap.',
      madeBy: 'claude' as const,
    },
    {
      icon: <Palette className="w-12 h-12 text-cyan-400" />,
      title: 'Gradient Generator',
      href: '/demo/gradient',
      description:
        'Create beautiful CSS gradients with live preview. Supports linear, radial, and conic gradients.',
      madeBy: 'claude' as const,
    },
    {
      icon: <Video className="w-12 h-12 text-cyan-400" />,
      title: 'Webcam Tester',
      href: '/demo/webcam',
      description:
        'Test your webcam with live preview, capture photos, and verify camera settings.',
      madeBy: 'claude' as const,
    },
    {
      icon: <Timer className="w-12 h-12 text-cyan-400" />,
      title: 'Pomodoro Timer',
      href: '/demo/pomodoro',
      description:
        'Focus timer with work sessions, breaks, and productivity stats. Tracks your progress with Convex.',
      madeBy: 'claude' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/tanstack-circle-logo.png"
              alt="TanStack Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
              <span className="text-gray-300">Jacob's</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Demos
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            A TanStack Start app for quickly creating anything          </p>
          
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              to={feature.href}
              key={index}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              {feature.madeBy && (
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                    feature.madeBy === 'hand'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}
                >
                  {feature.madeBy === 'hand' ? '✋ by hand' : '✨ with Claude'}
                </span>
              )}
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
