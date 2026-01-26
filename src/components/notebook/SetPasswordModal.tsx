import { useState, useCallback, FormEvent } from 'react'
import { Lock, Unlock, X, AlertCircle, Check } from 'lucide-react'

interface SetPasswordModalProps {
  isLocked: boolean
  isOpen: boolean
  isLoading: boolean
  onSetPassword: (password: string) => void
  onRemovePassword: () => void
  onClose: () => void
}

export default function SetPasswordModal({
  isLocked,
  isOpen,
  isLoading,
  onSetPassword,
  onRemovePassword,
  onClose,
}: SetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setError(null)

      if (password.length < 4) {
        setError('Password must be at least 4 characters')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      onSetPassword(password)
    },
    [password, confirmPassword, onSetPassword],
  )

  const handleRemove = useCallback(() => {
    setError(null)
    onRemovePassword()
  }, [onRemovePassword])

  const handleClose = useCallback(() => {
    setPassword('')
    setConfirmPassword('')
    setError(null)
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
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isLocked ? 'bg-amber-500/20' : 'bg-cyan-500/20'
              }`}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-amber-400" />
              ) : (
                <Unlock className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-white">
              {isLocked ? 'Change Password' : 'Set Password'}
            </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-400">
            {isLocked
              ? 'Enter a new password or remove protection from this page.'
              : 'Protect this page with a password. Anyone who wants to view it will need to enter the password.'}
          </p>

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {isLocked ? 'New Password' : 'Password'}
            </label>
            <input
              type="password"
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            {isLocked ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isLoading}
                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Unlock size={16} />
                Remove Password
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {isLocked ? 'Update' : 'Set Password'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
