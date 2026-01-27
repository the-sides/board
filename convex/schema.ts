import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  notebookPages: defineTable({
    title: v.string(),
    content: v.string(),        // Tiptap JSON as string
    createdAt: v.number(),
    updatedAt: v.number(),
    preview: v.optional(v.string()), // Plain text excerpt for grid
    passwordHash: v.optional(v.string()), // bcrypt hash for page protection
  }).index('by_updated', ['updatedAt']),
  pomodoroSessions: defineTable({
    date: v.string(),           // "2026-01-26" format for daily grouping
    completedPomodoros: v.number(),
    totalFocusMinutes: v.number(),
  }).index('by_date', ['date']),
  giveawayEntries: defineTable({
    username: v.string(),
    count: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_username', ['username']),
})
