import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

// Get today's stats (or defaults if none exist)
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const today = getTodayString()
    const record = await ctx.db
      .query('pomodoroSessions')
      .withIndex('by_date', (q) => q.eq('date', today))
      .first()

    return record ?? {
      date: today,
      completedPomodoros: 0,
      totalFocusMinutes: 0,
    }
  },
})

// Get last 7 days of stats for chart
export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    // Generate last 7 days
    const days: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toISOString().slice(0, 10))
    }

    // Fetch all records in date range
    const records = await ctx.db
      .query('pomodoroSessions')
      .withIndex('by_date')
      .collect()

    // Create a map for quick lookup
    const recordMap = new Map(records.map((r) => [r.date, r]))

    // Return data for all 7 days, with defaults for missing days
    return days.map((date) => {
      const record = recordMap.get(date)
      return {
        date,
        completedPomodoros: record?.completedPomodoros ?? 0,
        totalFocusMinutes: record?.totalFocusMinutes ?? 0,
      }
    })
  },
})

// Get all-time aggregated totals
export const getTotals = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query('pomodoroSessions').collect()

    return records.reduce(
      (acc, record) => ({
        totalPomodoros: acc.totalPomodoros + record.completedPomodoros,
        totalFocusMinutes: acc.totalFocusMinutes + record.totalFocusMinutes,
        totalDays: acc.totalDays + 1,
      }),
      { totalPomodoros: 0, totalFocusMinutes: 0, totalDays: 0 }
    )
  },
})

// Record a completed work session (upsert pattern)
export const recordSession = mutation({
  args: {
    focusMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const today = getTodayString()

    // Check if record exists for today
    const existing = await ctx.db
      .query('pomodoroSessions')
      .withIndex('by_date', (q) => q.eq('date', today))
      .first()

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        completedPomodoros: existing.completedPomodoros + 1,
        totalFocusMinutes: existing.totalFocusMinutes + args.focusMinutes,
      })
    } else {
      // Create new record
      await ctx.db.insert('pomodoroSessions', {
        date: today,
        completedPomodoros: 1,
        totalFocusMinutes: args.focusMinutes,
      })
    }
  },
})
