import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useReducer, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
} from 'lucide-react'

import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/demo/pomodoro')({
  ssr: false,
  component: PomodoroTimer,
})

// Types
type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface TimerSettings {
  workDuration: number       // minutes
  shortBreakDuration: number
  longBreakDuration: number
}

interface TimerState {
  mode: TimerMode
  timeRemaining: number      // seconds
  isRunning: boolean
  sessionsCompleted: number  // 0-4, resets after long break
  settings: TimerSettings
}

type TimerAction =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'UPDATE_SETTINGS'; settings: TimerSettings }
  | { type: 'SET_MODE'; mode: TimerMode }

// Constants
const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
}

const STORAGE_KEY = 'pomodoro-settings'

// Mode colors
const MODE_COLORS: Record<TimerMode, { primary: string; bg: string; text: string; ring: string }> = {
  work: {
    primary: 'rgb(34, 211, 238)', // cyan-400
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    ring: 'stroke-cyan-400',
  },
  shortBreak: {
    primary: 'rgb(74, 222, 128)', // green-400
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    ring: 'stroke-green-400',
  },
  longBreak: {
    primary: 'rgb(192, 132, 252)', // purple-400
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    ring: 'stroke-purple-400',
  },
}

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

// Load settings from localStorage
function loadSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parsing errors
  }
  return DEFAULT_SETTINGS
}

// Save settings to localStorage
function saveSettings(settings: TimerSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// Get duration in seconds for a mode
function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case 'work':
      return settings.workDuration * 60
    case 'shortBreak':
      return settings.shortBreakDuration * 60
    case 'longBreak':
      return settings.longBreakDuration * 60
  }
}

// Reducer
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'TICK':
      if (state.timeRemaining <= 0) return state
      return { ...state, timeRemaining: state.timeRemaining - 1 }

    case 'START':
      return { ...state, isRunning: true }

    case 'PAUSE':
      return { ...state, isRunning: false }

    case 'RESET':
      return {
        ...state,
        timeRemaining: getDurationForMode(state.mode, state.settings),
        isRunning: false,
      }

    case 'SKIP': {
      const nextMode = getNextMode(state.mode, state.sessionsCompleted)
      return {
        ...state,
        mode: nextMode,
        timeRemaining: getDurationForMode(nextMode, state.settings),
        isRunning: false,
      }
    }

    case 'COMPLETE_SESSION': {
      // Only increment sessions when completing a work session
      const newSessions = state.mode === 'work'
        ? (state.sessionsCompleted + 1) % 4
        : state.sessionsCompleted
      const nextMode = getNextMode(state.mode, state.sessionsCompleted)
      return {
        ...state,
        mode: nextMode,
        timeRemaining: getDurationForMode(nextMode, state.settings),
        isRunning: false,
        sessionsCompleted: newSessions,
      }
    }

    case 'UPDATE_SETTINGS': {
      saveSettings(action.settings)
      return {
        ...state,
        settings: action.settings,
        // Only update time if timer isn't running
        timeRemaining: state.isRunning
          ? state.timeRemaining
          : getDurationForMode(state.mode, action.settings),
      }
    }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        timeRemaining: getDurationForMode(action.mode, state.settings),
        isRunning: false,
      }

    default:
      return state
  }
}

// Get next mode based on current mode and session count
function getNextMode(currentMode: TimerMode, sessionsCompleted: number): TimerMode {
  if (currentMode === 'work') {
    // After 4 work sessions (indices 0-3), take a long break
    return sessionsCompleted === 3 ? 'longBreak' : 'shortBreak'
  }
  return 'work'
}

// Format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Circular Progress Component
function CircularProgress({
  progress,
  mode,
  size = 280,
  strokeWidth = 8,
}: {
  progress: number
  mode: TimerMode
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgb(51, 65, 85)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={`${MODE_COLORS[mode].ring} transition-all duration-300`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
    </svg>
  )
}

// Session Dots Component
function SessionDots({ completed, mode }: { completed: number; mode: TimerMode }) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < completed
              ? `${MODE_COLORS.work.bg} border-2 border-cyan-400`
              : 'bg-slate-700 border-2 border-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

// Settings Panel Component
function SettingsPanel({
  settings,
  onUpdate,
  isOpen,
  onToggle,
}: {
  settings: TimerSettings
  onUpdate: (settings: TimerSettings) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  // Sync local settings when props change
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key: keyof TimerSettings, value: number) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onUpdate(newSettings)
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700 pt-4">
          {/* Work Duration */}
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Focus Duration</span>
              <span className="text-cyan-400">{localSettings.workDuration} min</span>
            </label>
            <input
              type="range"
              min={1}
              max={60}
              value={localSettings.workDuration}
              onChange={(e) => handleChange('workDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Short Break */}
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Short Break</span>
              <span className="text-green-400">{localSettings.shortBreakDuration} min</span>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={localSettings.shortBreakDuration}
              onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-400"
            />
          </div>

          {/* Long Break */}
          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Long Break</span>
              <span className="text-purple-400">{localSettings.longBreakDuration} min</span>
            </label>
            <input
              type="range"
              min={1}
              max={60}
              value={localSettings.longBreakDuration}
              onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Week Chart Component (Pure SVG)
function WeekChart({ data }: { data: Array<{ date: string; completedPomodoros: number }> }) {
  const maxValue = Math.max(...data.map((d) => d.completedPomodoros), 1)
  const chartHeight = 100
  const barWidth = 32
  const gap = 8
  const chartWidth = data.length * (barWidth + gap) - gap

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Last 7 Days</h3>
      <svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} preserveAspectRatio="xMidYMid meet">
        {data.map((day, i) => {
          const barHeight = (day.completedPomodoros / maxValue) * chartHeight
          const x = i * (barWidth + gap)
          const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
          const isToday = day.date === new Date().toISOString().slice(0, 10)

          return (
            <g key={day.date}>
              {/* Bar background */}
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                fill="rgb(51, 65, 85)"
                rx={4}
              />
              {/* Bar value */}
              <rect
                x={x}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                fill={isToday ? 'rgb(34, 211, 238)' : 'rgb(100, 116, 139)'}
                rx={4}
              />
              {/* Value label */}
              {day.completedPomodoros > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - barHeight - 5}
                  textAnchor="middle"
                  fill="rgb(148, 163, 184)"
                  fontSize="10"
                >
                  {day.completedPomodoros}
                </text>
              )}
              {/* Day label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 18}
                textAnchor="middle"
                fill={isToday ? 'rgb(34, 211, 238)' : 'rgb(148, 163, 184)'}
                fontSize="10"
                fontWeight={isToday ? 'bold' : 'normal'}
              >
                {dayLabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Stats Panel Component
function StatsPanel({
  todayStats,
  weekData,
  totals,
}: {
  todayStats: { completedPomodoros: number; totalFocusMinutes: number } | undefined
  weekData: Array<{ date: string; completedPomodoros: number; totalFocusMinutes: number }> | undefined
  totals: { totalPomodoros: number; totalFocusMinutes: number; totalDays: number } | undefined
}) {
  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Timer className="w-5 h-5 text-cyan-400" />
        Statistics
      </h2>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {todayStats?.completedPomodoros ?? 0}
          </div>
          <div className="text-xs text-slate-400">Today's Pomodoros</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {formatHours(todayStats?.totalFocusMinutes ?? 0)}
          </div>
          <div className="text-xs text-slate-400">Focus Time</div>
        </div>
      </div>

      {/* Week Chart */}
      {weekData && <WeekChart data={weekData} />}

      {/* All-time Stats */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-medium text-slate-400 mb-3">All Time</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-white">
              {totals?.totalPomodoros ?? 0}
            </div>
            <div className="text-xs text-slate-500">Pomodoros</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {formatHours(totals?.totalFocusMinutes ?? 0)}
            </div>
            <div className="text-xs text-slate-500">Focus Time</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {totals?.totalDays ?? 0}
            </div>
            <div className="text-xs text-slate-500">Active Days</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
function PomodoroTimer() {
  // Convex queries and mutations
  const todayStats = useQuery(api.pomodoroSessions.getToday)
  const weekData = useQuery(api.pomodoroSessions.getRecent)
  const totals = useQuery(api.pomodoroSessions.getTotals)
  const recordSession = useMutation(api.pomodoroSessions.recordSession)

  // Load initial settings from localStorage
  const initialSettings = loadSettings()

  // Timer state
  const [state, dispatch] = useReducer(timerReducer, {
    mode: 'work' as TimerMode,
    timeRemaining: initialSettings.workDuration * 60,
    isRunning: false,
    sessionsCompleted: 0,
    settings: initialSettings,
  })

  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  // Audio ref for completion sound
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio and check notification permission
  useEffect(() => {
    // Create audio element for completion sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleBADj9LefEIhDIXO8oNPJxF6yu+IXi0WcsXxjWQzG2q/8pJpOB9mt/OXbj4hYbH0nHJDJF+r9p91RyhapPebdkopVp33nntPLFGX+KKAUy5NkfijhFcvSIz5p4daL0WI+quLXTBDhPqukV8vQYH6sZVhLz9++rOYYy89e/q2m2QtPXj6uZ5lLTt1+ryiZyw5cvq/pWotN2/6wqhsLTVs+sWrbyw0afvIrm8tM2b6ya9yLzFi+sqxdDAvX/nMtHcxLlz4zrZ5MS5Z+c+5ejEtV/jQu30yLFT30L6AMStR9dDBgzIqT/PR'
    )

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Timer interval
  useEffect(() => {
    if (!state.isRunning) return

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isRunning])

  // Update document title
  useEffect(() => {
    if (state.isRunning) {
      document.title = `${formatTime(state.timeRemaining)} - ${MODE_LABELS[state.mode]}`
    } else {
      document.title = 'Pomodoro Timer'
    }

    return () => {
      document.title = 'Pomodoro Timer'
    }
  }, [state.timeRemaining, state.isRunning, state.mode])

  // Handle timer completion
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      // Play sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        })
      }

      // Show notification
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        const message = state.mode === 'work'
          ? 'Great work! Time for a break.'
          : 'Break is over. Ready to focus?'
        new Notification('Pomodoro Timer', {
          body: message,
          icon: '/favicon.ico',
        })
      }

      // Record session to Convex if work session completed
      if (state.mode === 'work') {
        recordSession({ focusMinutes: state.settings.workDuration })
      }

      // Move to next mode
      dispatch({ type: 'COMPLETE_SESSION' })
    }
  }, [state.timeRemaining, state.isRunning, state.mode, soundEnabled, notificationsEnabled, recordSession, state.settings.workDuration])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    setNotificationsEnabled(permission === 'granted')
  }, [])

  // Calculate progress
  const totalDuration = getDurationForMode(state.mode, state.settings)
  const progress = (totalDuration - state.timeRemaining) / totalDuration

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Timer className={`w-10 h-10 ${MODE_COLORS[state.mode].text}`} />
            <h1 className="text-4xl font-bold text-white">Pomodoro Timer</h1>
          </div>
          <p className="text-slate-400">
            Focus, take breaks, and track your productivity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Tabs */}
            <div className="flex justify-center gap-2">
              {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => dispatch({ type: 'SET_MODE', mode })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    state.mode === mode
                      ? `${MODE_COLORS[mode].bg} ${MODE_COLORS[mode].text}`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <CircularProgress progress={progress} mode={state.mode} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-6xl font-bold ${MODE_COLORS[state.mode].text} font-mono`}>
                    {formatTime(state.timeRemaining)}
                  </div>
                  <div className="text-slate-400 mt-2">{MODE_LABELS[state.mode]}</div>
                </div>
              </div>

              {/* Session Dots */}
              <div className="mt-6">
                <SessionDots completed={state.sessionsCompleted} mode={state.mode} />
                <p className="text-xs text-slate-500 text-center mt-2">
                  {state.sessionsCompleted}/4 sessions until long break
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              {!state.isRunning ? (
                <button
                  onClick={() => dispatch({ type: 'START' })}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    state.mode === 'work'
                      ? 'bg-cyan-600 hover:bg-cyan-500'
                      : state.mode === 'shortBreak'
                      ? 'bg-green-600 hover:bg-green-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  } text-white shadow-lg hover:shadow-xl`}
                >
                  <Play className="w-6 h-6" />
                  Start
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'PAUSE' })}
                  className="flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <Pause className="w-6 h-6" />
                  Pause
                </button>
              )}

              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => dispatch({ type: 'SKIP' })}
                className="flex items-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
                title="Skip to next"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Sound & Notification Toggles */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  soundEnabled
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-sm">Sound</span>
              </button>

              <button
                onClick={() => {
                  if (notificationPermission === 'default') {
                    requestNotificationPermission()
                  } else {
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  notificationsEnabled
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span className="text-sm">
                  {notificationPermission === 'denied' ? 'Blocked' : 'Notify'}
                </span>
              </button>
            </div>

            {/* Settings Panel */}
            <SettingsPanel
              settings={state.settings}
              onUpdate={(settings) => dispatch({ type: 'UPDATE_SETTINGS', settings })}
              isOpen={settingsOpen}
              onToggle={() => setSettingsOpen(!settingsOpen)}
            />
          </div>

          {/* Stats Sidebar */}
          <div>
            <StatsPanel
              todayStats={todayStats}
              weekData={weekData}
              totals={totals}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500/80 text-sm">
            The Pomodoro Technique: 25 min focus + 5 min break. Long break after 4 cycles.
          </p>
        </div>
      </div>
    </main>
  )
}
