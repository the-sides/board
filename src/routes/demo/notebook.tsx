import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useAction } from 'convex/react'
import { BookOpen } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import NotebookGrid from '../../components/notebook/NotebookGrid'
import NotebookEditor from '../../components/notebook/NotebookEditor'
import PasswordModal from '../../components/notebook/PasswordModal'
import SetPasswordModal from '../../components/notebook/SetPasswordModal'

export const Route = createFileRoute('/demo/notebook')({
  ssr: false,
  component: NotebookPage,
})

function NotebookPage() {
  // Selected page state
  const [selectedPageId, setSelectedPageId] = useState<Id<'notebookPages'> | null>(null)

  // Password verification state
  const [unlockedPages, setUnlockedPages] = useState<Set<Id<'notebookPages'>>>(new Set())
  const [passwordModalPageId, setPasswordModalPageId] = useState<Id<'notebookPages'> | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Set password modal state
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)
  const [isSettingPassword, setIsSettingPassword] = useState(false)

  // Convex queries and mutations
  const pages = useQuery(api.notebookPages.list)
  const selectedPage = useQuery(
    api.notebookPages.get,
    selectedPageId ? { id: selectedPageId } : 'skip',
  )
  const createPage = useMutation(api.notebookPages.create)
  const updatePage = useMutation(api.notebookPages.update)
  const removePage = useMutation(api.notebookPages.remove)
  const verifyPassword = useAction(api.notebookPages.verifyPassword)
  const setPassword = useAction(api.notebookPages.setPassword)

  // Get the page info for the password modal
  const passwordModalPage = passwordModalPageId
    ? pages?.find((p) => p._id === passwordModalPageId)
    : null

  const handleCreatePage = useCallback(async () => {
    const id = await createPage()
    setSelectedPageId(id)
  }, [createPage])

  const handleOpenPage = useCallback(
    (id: Id<'notebookPages'>) => {
      const page = pages?.find((p) => p._id === id)

      // If page is locked and not already unlocked, show password modal
      if (page?.isLocked && !unlockedPages.has(id)) {
        setPasswordModalPageId(id)
        setPasswordError(null)
      } else {
        setSelectedPageId(id)
      }
    },
    [pages, unlockedPages],
  )

  const handleDeletePage = useCallback(
    async (id: Id<'notebookPages'>) => {
      if (window.confirm('Are you sure you want to delete this page?')) {
        await removePage({ id })
        if (selectedPageId === id) {
          setSelectedPageId(null)
        }
        // Clean up from unlocked pages
        setUnlockedPages((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [removePage, selectedPageId],
  )

  const handleSave = useCallback(
    async (title: string, content: string, preview: string) => {
      if (selectedPageId) {
        await updatePage({
          id: selectedPageId,
          title,
          content,
          preview,
        })
      }
    },
    [selectedPageId, updatePage],
  )

  const handleCloseEditor = useCallback(() => {
    setSelectedPageId(null)
  }, [])

  // Password verification handlers
  const handlePasswordSubmit = useCallback(
    async (password: string) => {
      if (!passwordModalPageId) return

      setIsVerifying(true)
      setPasswordError(null)

      try {
        const isValid = await verifyPassword({
          id: passwordModalPageId,
          password,
        })

        if (isValid) {
          // Add to unlocked pages and open the page
          setUnlockedPages((prev) => new Set(prev).add(passwordModalPageId))
          setSelectedPageId(passwordModalPageId)
          setPasswordModalPageId(null)
        } else {
          setPasswordError('Incorrect password')
        }
      } catch (error) {
        setPasswordError('Failed to verify password')
      } finally {
        setIsVerifying(false)
      }
    },
    [passwordModalPageId, verifyPassword],
  )

  const handlePasswordModalClose = useCallback(() => {
    setPasswordModalPageId(null)
    setPasswordError(null)
  }, [])

  // Set password handlers
  const handleLockClick = useCallback(() => {
    setShowSetPasswordModal(true)
  }, [])

  const handleSetPassword = useCallback(
    async (password: string) => {
      if (!selectedPageId) return

      setIsSettingPassword(true)

      try {
        await setPassword({
          id: selectedPageId,
          password,
        })
        // Automatically add to unlocked pages since we just set the password
        setUnlockedPages((prev) => new Set(prev).add(selectedPageId))
        setShowSetPasswordModal(false)
      } catch (error) {
        console.error('Failed to set password:', error)
      } finally {
        setIsSettingPassword(false)
      }
    },
    [selectedPageId, setPassword],
  )

  const handleRemovePassword = useCallback(async () => {
    if (!selectedPageId) return

    setIsSettingPassword(true)

    try {
      await setPassword({
        id: selectedPageId,
        password: undefined,
      })
      // Remove from unlocked pages since it's no longer locked
      setUnlockedPages((prev) => {
        const next = new Set(prev)
        next.delete(selectedPageId)
        return next
      })
      setShowSetPasswordModal(false)
    } catch (error) {
      console.error('Failed to remove password:', error)
    } finally {
      setIsSettingPassword(false)
    }
  }, [selectedPageId, setPassword])

  const handleSetPasswordModalClose = useCallback(() => {
    setShowSetPasswordModal(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Notebook</h1>
              <p className="text-gray-400">
                Real-time collaborative notes with rich text editing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <NotebookGrid
          pages={pages}
          onCreatePage={handleCreatePage}
          onOpenPage={handleOpenPage}
          onDeletePage={handleDeletePage}
        />
      </div>

      {/* Editor Modal */}
      <NotebookEditor
        page={selectedPage}
        isOpen={selectedPageId !== null}
        onClose={handleCloseEditor}
        onSave={handleSave}
        onLockClick={handleLockClick}
      />

      {/* Password Entry Modal */}
      <PasswordModal
        pageTitle={passwordModalPage?.title || ''}
        isOpen={passwordModalPageId !== null}
        isLoading={isVerifying}
        error={passwordError}
        onSubmit={handlePasswordSubmit}
        onClose={handlePasswordModalClose}
      />

      {/* Set Password Modal */}
      <SetPasswordModal
        isLocked={selectedPage?.isLocked ?? false}
        isOpen={showSetPasswordModal}
        isLoading={isSettingPassword}
        onSetPassword={handleSetPassword}
        onRemovePassword={handleRemovePassword}
        onClose={handleSetPasswordModalClose}
      />

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">
          Built with Convex + Tiptap • Real-time sync • Always saved
        </p>
      </div>
    </div>
  )
}
