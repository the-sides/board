import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/demo/clipboard')({
  component: ClipboardDemo,
})

function ClipboardDemo() {
  const [flyingPaper, setFlyingPaper] = useState<string | null>(null)

  const handlePaperClick = (key: string) => {
    if (flyingPaper) return
    setFlyingPaper(key)
  }

  const handleFlyAnimationEnd = () => {
    setFlyingPaper(null)
  }

  return (
    <main
      className="flex flex-col items-end justify-start min-h-screen p-24 pl-0 overflow-hidden relative"
      style={{
        backgroundColor: '#1a1a2e',
        backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Centered header */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-[10%]">
        <h1 className="text-6xl font-bold text-white tracking-tight mb-4">
          Merger<span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-md text-center">
          Review hundreds of documents in seconds, not hours
        </p>
      </div>

      <div
        className="relative cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* Main clipboard face */}
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{
            transform: 'rotateX(60deg) rotateY(20deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* The SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="270"
            height="337"
            viewBox="0 0 541 675"
            fill="none"
            className="relative z-10 scale-150"
          >
            <rect width="541" height="660" y="15" fill="#7D3401" rx="21" />
            <rect width="488" height="614" x="26" y="35" fill="#FEFEFE" rx="21" />
            <g filter="url(#a)">
              <path
                fill="#D9D9D9"
                d="M176.174 33.302A7 7 0 0 1 182.965 28h174.42a7 7 0 0 1 6.833 5.481l.889 4c.971 4.372-2.355 8.519-6.833 8.519H181.965c-4.554 0-7.895-4.28-6.791-8.698l1-4Z"
              />
            </g>
            <g filter="url(#b)">
              <path
                fill="#C6C6C6"
                d="M224.078 4.834c32.344-6.359 62.346-6.531 94.422 0C351.452 11.544 367 35 367 35H173s17.4-23.545 51.078-30.166Z"
              />
            </g>
            <defs>
              <filter
                id="a"
                width="198.315"
                height="26"
                x="170.962"
                y="28"
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_44_13" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_44_13" result="shape" />
              </filter>
              <filter
                id="b"
                width="202"
                height="43"
                x="169"
                y="0"
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_44_13" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_44_13" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes paperFlow {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(120px, 64px);
          }
        }

        @keyframes flyAway {
          0% {
            transform: var(--base-transform);
            opacity: 1;
          }
          15% {
            transform: var(--base-transform) translateZ(80px) scale(1.15);
            opacity: 1;
          }
          100% {
            transform: rotateX(60deg) rotateY(20deg) rotateZ(-45deg) translateX(-400px) translateY(-800px) translateZ(300px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="papers w-1/2 h-1/2 transition-transform relative flex-1 mt-auto mr-auto"
        style={{
          transform: 'translate(-1200px, -400px)',
        }}
      >
        {/* Animated wrapper */}
        <div
          style={{
            animation: 'paperFlow 3s linear infinite',
          }}
        >
          {[1, 2, 3, 4].map((_, j) =>
            [1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7].map((_, i) => {
              const key = `${j}-${i}`
              const isFlying = flyingPaper === key
              const baseTransform = `translate(${320 * j}px, ${2 * j}px) rotateX(60deg) rotateY(0deg) rotateZ(-45deg)`

              return (
                <div
                  key={key}
                  onClick={() => handlePaperClick(key)}
                  onAnimationEnd={isFlying ? handleFlyAnimationEnd : undefined}
                  className={`w-50 shrink-0 aspect-3/2 bg-[rgba(255,255,255,0.85)] absolute cursor-pointer
                    hover:bg-white hover:shadow-lg transition-colors
                    ${isFlying ? 'z-50 pointer-events-none' : ''}`}
                  style={{
                    '--base-transform': baseTransform,
                    transform: baseTransform,
                    transformStyle: 'preserve-3d',
                    left: `${i * 120}px`,
                    top: `${i * 64}px`,
                    animation: isFlying ? 'flyAway 1s ease-in-out forwards' : undefined,
                  } as React.CSSProperties}
                />
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
