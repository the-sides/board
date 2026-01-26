import { mutation, query, action, internalQuery, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import bcrypt from 'bcryptjs'
import { internal } from './_generated/api'

const BCRYPT_ROUNDS = 10

export const list = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db
      .query('notebookPages')
      .withIndex('by_updated')
      .order('desc')
      .collect()

    // Exclude passwordHash from results, add isLocked boolean
    return pages.map(({ passwordHash, ...rest }) => ({
      ...rest,
      isLocked: !!passwordHash,
    }))
  },
})

export const get = query({
  args: { id: v.id('notebookPages') },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.id)
    if (!page) return null

    // Exclude passwordHash, add isLocked flag
    const { passwordHash, ...rest } = page
    return {
      ...rest,
      isLocked: !!passwordHash,
    }
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

// Internal query to get page WITH password hash (not exposed to client)
export const getWithHash = internalQuery({
  args: { id: v.id('notebookPages') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Internal mutation to update password hash
export const updatePasswordHash = internalMutation({
  args: {
    id: v.id('notebookPages'),
    passwordHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.id)
    if (!page) {
      throw new Error('Page not found')
    }
    await ctx.db.patch(args.id, {
      passwordHash: args.passwordHash,
      updatedAt: Date.now(),
    })
  },
})

// Action for password verification (uses bcrypt which is async)
export const verifyPassword = action({
  args: {
    id: v.id('notebookPages'),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const page = await ctx.runQuery(internal.notebookPages.getWithHash, {
      id: args.id,
    })

    if (!page) {
      throw new Error('Page not found')
    }

    if (!page.passwordHash) {
      // No password set, always valid
      return true
    }

    const isValid: boolean = await bcrypt.compare(args.password, page.passwordHash)
    return isValid
  },
})

// Action to hash and set password (since bcrypt is async)
export const setPassword = action({
  args: {
    id: v.id('notebookPages'),
    password: v.optional(v.string()), // null/undefined to remove password
  },
  handler: async (ctx, args) => {
    let passwordHash: string | undefined = undefined

    if (args.password) {
      passwordHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS)
    }

    await ctx.runMutation(internal.notebookPages.updatePasswordHash, {
      id: args.id,
      passwordHash,
    })
  },
})
