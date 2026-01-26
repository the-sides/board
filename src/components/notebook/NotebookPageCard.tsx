import { Trash2, FileText } from 'lucide-react'
import { Id } from '../../../convex/_generated/dataModel'

interface NotebookPageCardProps {
  id: Id<'notebookPages'>
  title: string
  preview?: string
  updatedAt: number
  onOpen: () => void
  onDelete: () => void
}

export default function NotebookPageCard({
  title,
  preview,
  updatedAt,
  onOpen,
  onDelete,
}: NotebookPageCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      onClick={onOpen}
      className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Delete page"
      >
        <Trash2 size={16} />
      </button>

      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <FileText className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" />
        <h3 className="text-lg font-semibold text-white line-clamp-2 pr-8">
          {title || 'Untitled'}
        </h3>
      </div>

      {/* Preview text */}
      <p className="text-gray-400 text-sm line-clamp-3 mb-3 min-h-[3.6em]">
        {preview || 'No content yet...'}
      </p>

      {/* Timestamp */}
      <p className="text-gray-500 text-xs">{formatDate(updatedAt)}</p>
    </div>
  )
}
