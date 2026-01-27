import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Gift,
  Plus,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  X,
  Loader2,
  Trophy,
} from 'lucide-react'

export const Route = createFileRoute('/demo/giveaway')({
  component: GiveawayManager,
  ssr: false,
})

type SortField = 'username' | 'count'
type SortDirection = 'asc' | 'desc'

type Entry = {
  _id: Id<'giveawayEntries'>
  username: string
  count: number
  createdAt: number
  updatedAt: number
}

function GiveawayManager() {
  const entries = useQuery(api.giveawayEntries.list) ?? []
  const addEntry = useMutation(api.giveawayEntries.addEntry)
  const updateEntry = useMutation(api.giveawayEntries.updateEntry)
  const removeEntry = useMutation(api.giveawayEntries.removeEntry)
  const clearAll = useMutation(api.giveawayEntries.clearAll)

  // Form state
  const [username, setUsername] = useState('')
  const [count, setCount] = useState('1')
  const [isAdding, setIsAdding] = useState(false)

  // Sort state
  const [sortField, setSortField] = useState<SortField>('count')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Edit state
  const [editingId, setEditingId] = useState<Id<'giveawayEntries'> | null>(null)
  const [editCount, setEditCount] = useState('')

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Calculate total submissions
  const totalSubmissions = entries.reduce((sum, e) => sum + e.count, 0)

  // Sort entries
  const sortedEntries = [...entries].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1
    if (sortField === 'username') {
      return a.username.localeCompare(b.username) * modifier
    }
    return (a.count - b.count) * modifier
  })

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'count' ? 'desc' : 'asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown size={14} className="opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    )
  }

  // Handle form submission
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || isAdding) return

    const countNum = parseInt(count, 10)
    if (isNaN(countNum) || countNum < 1) return

    setIsAdding(true)
    try {
      await addEntry({ username: username.trim(), count: countNum })
      setUsername('')
      setCount('1')
    } finally {
      setIsAdding(false)
    }
  }

  // Handle edit
  const startEdit = (entry: Entry) => {
    setEditingId(entry._id)
    setEditCount(String(entry.count))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditCount('')
  }

  const saveEdit = async (id: Id<'giveawayEntries'>) => {
    const countNum = parseInt(editCount, 10)
    if (isNaN(countNum) || countNum < 1) return

    await updateEntry({ id, count: countNum })
    setEditingId(null)
    setEditCount('')
  }

  // Spin the wheel
  const spinWheel = useCallback(() => {
    if (entries.length === 0 || isSpinning) return

    setIsSpinning(true)
    setWinner(null)

    // Weighted random selection
    const random = Math.random() * totalSubmissions
    let cumulative = 0
    let selectedWinner = entries[0].username

    for (const entry of entries) {
      cumulative += entry.count
      if (random <= cumulative) {
        selectedWinner = entry.username
        break
      }
    }

    // Calculate spin animation
    // Find winner's position in the wheel
    let winnerAngle = 0
    let currentAngle = 0
    for (const entry of entries) {
      const entryAngle = (entry.count / totalSubmissions) * 360
      if (entry.username === selectedWinner) {
        // Point to the middle of this segment
        winnerAngle = currentAngle + entryAngle / 2
        break
      }
      currentAngle += entryAngle
    }

    // Spin multiple rotations plus land on winner
    // The pointer is at the top (0 degrees), so we need to rotate the wheel
    // so the winner segment is at the top
    const spins = 5 + Math.random() * 3 // 5-8 full rotations
    const targetRotation = rotation + spins * 360 + (360 - winnerAngle)

    setRotation(targetRotation)

    // Announce winner after animation
    setTimeout(() => {
      setWinner(selectedWinner)
      setIsSpinning(false)
    }, 4000)
  }, [entries, isSpinning, totalSubmissions, rotation])

  // Generate wheel segments
  const wheelSegments = entries.map((entry, index) => {
    const percentage = (entry.count / totalSubmissions) * 100
    const angle = (entry.count / totalSubmissions) * 360
    return { ...entry, percentage, angle, index }
  })

  // Generate colors for wheel segments
  const colors = [
    '#06b6d4', // cyan-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#f43f5e', // rose-500
    '#3b82f6', // blue-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#a855f7', // purple-500
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Gift className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Giveaway Manager</h1>
            <p className="text-gray-400">
              Track submissions and spin to pick a winner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Entry Form & List */}
          <div className="space-y-6">
            {/* Add Entry Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Add Submission
              </h2>
              <form onSubmit={handleAdd} className="flex gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  placeholder="Count"
                  className="w-24 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!username.trim() || isAdding}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isAdding ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  Add
                </button>
              </form>
              <p className="mt-2 text-sm text-gray-500">
                Adding to an existing username will increment their count
              </p>
            </div>

            {/* Entries List */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Entries ({entries.length})
                </h2>
                {entries.length > 0 && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to clear all entries?'
                        )
                      ) {
                        clearAll()
                      }
                    }}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw size={14} />
                    Clear All
                  </button>
                )}
              </div>

              {entries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No entries yet. Add some usernames above!
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-600">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700/50">
                        <th className="text-left p-3">
                          <button
                            onClick={() => handleSort('username')}
                            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
                          >
                            Username {getSortIcon('username')}
                          </button>
                        </th>
                        <th className="text-right p-3">
                          <button
                            onClick={() => handleSort('count')}
                            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors ml-auto"
                          >
                            Count {getSortIcon('count')}
                          </button>
                        </th>
                        <th className="text-right p-3 w-24">
                          <span className="text-gray-300">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {sortedEntries.map((entry) => (
                        <tr
                          key={entry._id}
                          className="hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="p-3 text-white">{entry.username}</td>
                          <td className="p-3 text-right">
                            {editingId === entry._id ? (
                              <input
                                type="number"
                                value={editCount}
                                onChange={(e) => setEditCount(e.target.value)}
                                min="1"
                                className="w-20 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-right focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(entry._id)
                                  if (e.key === 'Escape') cancelEdit()
                                }}
                              />
                            ) : (
                              <span className="text-cyan-400 font-medium">
                                {entry.count}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {editingId === entry._id ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => saveEdit(entry._id)}
                                  className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                  title="Save"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 text-gray-400 hover:bg-slate-600 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => startEdit(entry)}
                                  className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => removeEntry({ id: entry._id })}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-700/30 border-t border-slate-600">
                        <td className="p-3 text-gray-400 font-medium">Total</td>
                        <td className="p-3 text-right text-cyan-400 font-bold">
                          {totalSubmissions}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Wheel */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 text-center">
                Spin to Win!
              </h2>

              {/* Wheel Container */}
              <div className="relative flex justify-center items-center mb-6">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
                </div>

                {/* Wheel */}
                <div
                  ref={wheelRef}
                  className="relative w-72 h-72 rounded-full border-4 border-slate-600 shadow-2xl overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning
                      ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                      : 'none',
                  }}
                >
                  {entries.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                      <p className="text-gray-400 text-center px-4">
                        Add entries to spin the wheel
                      </p>
                    </div>
                  ) : (
                    <svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 w-full h-full"
                    >
                      {(() => {
                        let currentAngle = 0
                        return wheelSegments.map((segment, i) => {
                          const startAngle = currentAngle
                          const endAngle = currentAngle + segment.angle
                          currentAngle = endAngle

                          // Convert to radians and calculate path
                          const startRad = ((startAngle - 90) * Math.PI) / 180
                          const endRad = ((endAngle - 90) * Math.PI) / 180

                          const x1 = 50 + 50 * Math.cos(startRad)
                          const y1 = 50 + 50 * Math.sin(startRad)
                          const x2 = 50 + 50 * Math.cos(endRad)
                          const y2 = 50 + 50 * Math.sin(endRad)

                          const largeArc = segment.angle > 180 ? 1 : 0

                          const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`

                          // Calculate text position (middle of segment)
                          const midAngle =
                            ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
                          const textRadius = 32
                          const textX = 50 + textRadius * Math.cos(midAngle)
                          const textY = 50 + textRadius * Math.sin(midAngle)
                          const textRotation = (startAngle + endAngle) / 2

                          return (
                            <g key={segment._id}>
                              <path
                                d={pathD}
                                fill={colors[i % colors.length]}
                                stroke="#1e293b"
                                strokeWidth="0.5"
                              />
                              {segment.angle > 15 && (
                                <text
                                  x={textX}
                                  y={textY}
                                  fill="white"
                                  fontSize={segment.angle > 30 ? '4' : '3'}
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                  style={{
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                  }}
                                >
                                  {segment.username.length > 8
                                    ? segment.username.slice(0, 7) + '…'
                                    : segment.username}
                                </text>
                              )}
                            </g>
                          )
                        })
                      })()}
                      {/* Center circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="8"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Spin Button */}
              <div className="flex justify-center">
                <button
                  onClick={spinWheel}
                  disabled={entries.length === 0 || isSpinning}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2 shadow-lg"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Gift size={20} />
                      Spin the Wheel!
                    </>
                  )}
                </button>
              </div>

              {/* Winner Announcement */}
              {winner && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl text-center animate-pulse">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="text-yellow-400" size={24} />
                    <span className="text-yellow-400 font-bold text-lg">
                      Winner!
                    </span>
                    <Trophy className="text-yellow-400" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-white">{winner}</p>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            {entries.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Odds Breakdown
                </h2>
                <div className="space-y-2">
                  {sortedEntries.map((entry, i) => {
                    const percentage = (
                      (entry.count / totalSubmissions) *
                      100
                    ).toFixed(1)
                    return (
                      <div key={entry._id} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[entries.findIndex(e => e._id === entry._id) % colors.length] }}
                        />
                        <span className="text-gray-300 flex-1 truncate">
                          {entry.username}
                        </span>
                        <span className="text-cyan-400 font-medium">
                          {percentage}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
