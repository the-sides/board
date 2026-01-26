import { Plus, FileText } from 'lucide-react'
import NotebookPageCard from './NotebookPageCard'
import { Id, Doc } from '../../../convex/_generated/dataModel'

interface NotebookGridProps {
  pages: Doc<'notebookPages'>[] | undefined
  onCreatePage: () => void
  onOpenPage: (id: Id<'notebookPages'>) => void
  onDeletePage: (id: Id<'notebookPages'>) => void
}

export default function NotebookGrid({
  pages,
  onCreatePage,
  onOpenPage,
  onDeletePage,
}: NotebookGridProps) {
  if (!pages) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* New Page Card */}
      <button
        onClick={onCreatePage}
        className="flex flex-col items-center justify-center gap-3 bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-300 min-h-[180px]"
      >
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Plus className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="text-gray-300 font-medium">New Page</span>
      </button>

      {/* Page Cards */}
      {pages.map((page) => (
        <NotebookPageCard
          key={page._id}
          id={page._id}
          title={page.title}
          preview={page.preview}
          updatedAt={page.updatedAt}
          onOpen={() => onOpenPage(page._id)}
          onDelete={() => onDeletePage(page._id)}
        />
      ))}

      {/* Empty state hint */}
      {pages.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No pages yet
          </h3>
          <p className="text-gray-500">
            Click "New Page" to create your first notebook page
          </p>
        </div>
      )}
    </div>
  )
}
