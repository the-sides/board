import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Shuffle, Copy, Check, RotateCcw, Plus, Minus, CopyPlus } from 'lucide-react'

export const Route = createFileRoute('/demo/gradient')({
  component: GradientGenerator,
})

type GradientType = 'linear' | 'radial' | 'conic'

interface GradientColor {
  color: string
  position: number
}

function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360)
  const saturation = Math.floor(Math.random() * 40) + 60 // 60-100%
  const lightness = Math.floor(Math.random() * 30) + 35 // 35-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

function generateHarmoniousColors(count: number): GradientColor[] {
  const baseHue = Math.floor(Math.random() * 360)
  const colors: GradientColor[] = []

  for (let i = 0; i < count; i++) {
    // Create harmonious colors using golden angle
    const hue = (baseHue + i * 137.5) % 360
    const saturation = Math.floor(Math.random() * 20) + 70 // 70-90%
    const lightness = Math.floor(Math.random() * 20) + 40 // 40-60%
    colors.push({
      color: `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`,
      position: Math.round((i / (count - 1)) * 100),
    })
  }

  return colors
}

function GradientGenerator() {
  const [colors, setColors] = useState<GradientColor[]>(() => generateHarmoniousColors(3))
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [copied, setCopied] = useState(false)

  const generateGradientCSS = useCallback(() => {
    // Sort colors by position for correct gradient rendering
    const sortedColors = [...colors].sort((a, b) => a.position - b.position)
    const colorStops = sortedColors
      .map((c) => `${c.color} ${c.position}%`)
      .join(', ')

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorStops})`
      case 'radial':
        return `radial-gradient(circle, ${colorStops})`
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${colorStops})`
      default:
        return `linear-gradient(${angle}deg, ${colorStops})`
    }
  }, [colors, gradientType, angle])

  const cssCode = `background: ${generateGradientCSS()};`

  const handleRandomize = () => {
    const count = Math.floor(Math.random() * 2) + 2 // 2-3 colors
    setColors(generateHarmoniousColors(count))
    setAngle(Math.floor(Math.random() * 360))
    setGradientType(['linear', 'radial', 'conic'][Math.floor(Math.random() * 3)] as GradientType)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const updateColor = (index: number, newColor: string) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, color: newColor } : c))
    )
  }

  const updatePosition = (index: number, newPosition: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, position: newPosition } : c))
    )
  }

  const addColor = () => {
    if (colors.length >= 5) return
    const newColor = generateRandomColor()
    // Add new color at 50% position (user can adjust with slider)
    setColors((prev) => [...prev, { color: newColor, position: 50 }])
  }

  const removeColor = (index: number) => {
    if (colors.length <= 2) return
    // Remove color but preserve other positions
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  const duplicateColor = (index: number) => {
    if (colors.length >= 5) return
    const colorToDuplicate = colors[index]
    // Place duplicate 10% further along, clamped to 0-100
    const newPosition = Math.min(100, Math.max(0, colorToDuplicate.position + 10))
    setColors((prev) => [
      ...prev,
      { color: colorToDuplicate.color, position: newPosition },
    ])
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Gradient Preview */}
      <div
        className="flex-1 min-h-[50vh] transition-all duration-500 ease-out"
        style={{ background: generateGradientCSS() }}
      />

      {/* Controls Panel */}
      <div className="bg-slate-900 border-t border-slate-700 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Gradient Type & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {(['linear', 'radial', 'conic'] as GradientType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    gradientType === type
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <button
              onClick={handleRandomize}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              Randomize
            </button>
          </div>

          {/* Angle Control (for linear and conic) */}
          {(gradientType === 'linear' || gradientType === 'conic') && (
            <div className="flex items-center gap-4">
              <label className="text-slate-300 font-medium min-w-[60px]">
                Angle:
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value) % 361)}
                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                />
                <span className="text-slate-400">°</span>
              </div>
              <button
                onClick={() => setAngle(135)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Reset to 135°"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Color Stops */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Color Stops:</label>
              <button
                onClick={addColor}
                disabled={colors.length >= 5}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Color
              </button>
            </div>
            <div className="grid gap-3">
              {colors.map((colorStop, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-slate-800 rounded-lg p-3"
                >
                  <input
                    type="color"
                    value={colorStop.color.startsWith('hsl')
                      ? hslToHex(colorStop.color)
                      : colorStop.color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-slate-600 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Position</span>
                      <span className="text-slate-300 font-mono text-sm">{colorStop.position}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={colorStop.position}
                      onChange={(e) => updatePosition(index, Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => duplicateColor(index)}
                      disabled={colors.length >= 5}
                      className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Duplicate color"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>
                    {colors.length > 2 && (
                      <button
                        onClick={() => removeColor(index)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove color"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium">CSS Code:</label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-4 text-cyan-300 font-mono text-sm overflow-x-auto">
                {cssCode}
              </code>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// Helper function to convert HSL to Hex for the color picker
function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return '#888888'

  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
