import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('notebookPages')
      .withIndex('by_updated')
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('notebookPages') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    return await ctx.db.insert('notebookPages', {
      title: 'Untitled',
      content: '',
      createdAt: now,
      updatedAt: now,
      preview: '',
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('notebookPages'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    preview: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const page = await ctx.db.get(id)
    if (!page) {
      throw new Error('Page not found')
    }
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('notebookPages') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})
