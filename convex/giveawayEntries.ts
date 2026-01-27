import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all entries
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('giveawayEntries').collect()
  },
})

// Get total entry count (sum of all submission counts)
export const getTotalCount = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query('giveawayEntries').collect()
    return entries.reduce((sum, entry) => sum + entry.count, 0)
  },
})

// Add or increment an entry (upsert pattern)
export const addEntry = mutation({
  args: {
    username: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if username already exists
    const existing = await ctx.db
      .query('giveawayEntries')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    if (existing) {
      // Increment existing count
      await ctx.db.patch(existing._id, {
        count: existing.count + args.count,
        updatedAt: now,
      })
      return { action: 'incremented', newCount: existing.count + args.count }
    } else {
      // Create new entry
      await ctx.db.insert('giveawayEntries', {
        username: args.username,
        count: args.count,
        createdAt: now,
        updatedAt: now,
      })
      return { action: 'created', newCount: args.count }
    }
  },
})

// Update an entry's count directly (for editing)
export const updateEntry = mutation({
  args: {
    id: v.id('giveawayEntries'),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      count: args.count,
      updatedAt: Date.now(),
    })
  },
})

// Remove an entry
export const removeEntry = mutation({
  args: {
    id: v.id('giveawayEntries'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

// Clear all entries
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query('giveawayEntries').collect()
    for (const entry of entries) {
      await ctx.db.delete(entry._id)
    }
    return { deleted: entries.length }
  },
})
