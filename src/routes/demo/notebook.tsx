import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { BookOpen } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import NotebookGrid from '../../components/notebook/NotebookGrid'
import NotebookEditor from '../../components/notebook/NotebookEditor'

export const Route = createFileRoute('/demo/notebook')({
  ssr: false,
  component: NotebookPage,
})

function NotebookPage() {
  const [selectedPageId, setSelectedPageId] = useState<Id<'notebookPages'> | null>(null)

  // Convex queries and mutations
  const pages = useQuery(api.notebookPages.list)
  const selectedPage = useQuery(
    api.notebookPages.get,
    selectedPageId ? { id: selectedPageId } : 'skip',
  )
  const createPage = useMutation(api.notebookPages.create)
  const updatePage = useMutation(api.notebookPages.update)
  const removePage = useMutation(api.notebookPages.remove)

  const handleCreatePage = useCallback(async () => {
    const id = await createPage()
    setSelectedPageId(id)
  }, [createPage])

  const handleOpenPage = useCallback((id: Id<'notebookPages'>) => {
    setSelectedPageId(id)
  }, [])

  const handleDeletePage = useCallback(
    async (id: Id<'notebookPages'>) => {
      if (window.confirm('Are you sure you want to delete this page?')) {
        await removePage({ id })
        if (selectedPageId === id) {
          setSelectedPageId(null)
        }
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
