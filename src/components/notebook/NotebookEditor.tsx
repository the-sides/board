import { X, Save } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import TiptapEditor from './TiptapEditor'
import { Doc } from '../../../convex/_generated/dataModel'

interface NotebookEditorProps {
  page: Doc<'notebookPages'> | null | undefined
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, content: string, preview: string) => void
}

export default function NotebookEditor({
  page,
  isOpen,
  onClose,
  onSave,
}: NotebookEditorProps) {
  const [title, setTitle] = useState('')
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync title when page changes
  useEffect(() => {
    if (page) {
      setTitle(page.title)
    }
  }, [page])

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current)
      }
    }
  }, [])

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current)
      }
      titleDebounceRef.current = setTimeout(() => {
        if (page) {
          onSave(newTitle, page.content, page.preview || '')
        }
      }, 500)
    },
    [page, onSave],
  )

  const handleContentUpdate = useCallback(
    (content: string, preview: string) => {
      onSave(title, content, preview)
    },
    [title, onSave],
  )

  const handleClose = useCallback(() => {
    // Clear any pending debounces
    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current)
    }
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-gray-400">
            <Save size={16} />
            <span className="text-sm">Auto-saving...</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!page ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Page title..."
                className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none text-white placeholder-gray-500"
              />

              {/* Divider */}
              <div className="border-b border-gray-700" />

              {/* Editor */}
              <TiptapEditor
                content={page.content}
                onUpdate={handleContentUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
