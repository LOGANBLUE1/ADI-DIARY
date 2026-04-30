import { useState } from 'react'
import { supabase } from '../supabaseClient'

const ShareModal = ({ isOpen, onClose, shareType = 'all', categoryName = null, categories = [] }) => {
  const [shareTarget, setShareTarget] = useState('email')
  const [emailInput, setEmailInput] = useState('')
  const [userIdInput, setUserIdInput] = useState('')
  const [shareScope, setShareScope] = useState(shareType)
  const [selectedCategory, setSelectedCategory] = useState(categoryName || '')
  const [message, setMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  if (!isOpen) return null

  const handleShare = async () => {
    if (shareTarget === 'email' && !emailInput.trim()) {
      alert('Please enter a valid email address')
      return
    }

    if (shareTarget === 'userid' && !userIdInput.trim()) {
      alert('Please enter a valid user ID')
      return
    }

    if (shareScope === 'category' && !selectedCategory) {
      alert('Please select a category to share')
      return
    }

    setIsSharing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to share')
        return
      }

      // Prepare share data
      const shareData = {
        owner_id: user.id,
        share_type: shareScope,
        permission: 'view',
        status: 'pending',
        message: message.trim() || null
      }

      // Add target (email or user_id)
      if (shareTarget === 'email') {
        shareData.shared_with_email = emailInput.trim().toLowerCase()
      } else {
        shareData.shared_with_user_id = userIdInput.trim()
      }

      // Add category if sharing specific category
      if (shareScope === 'category') {
        shareData.category_name = selectedCategory
      }

      // Insert share
      const { data, error } = await supabase
        .from('shares')
        .insert([shareData])
        .select()

      if (error) throw error

      alert(`✅ Share invitation sent successfully!\n\nThey will be able to view your shared content once they accept.`)
      
      // Reset form
      setEmailInput('')
      setUserIdInput('')
      setMessage('')
      onClose()
    } catch (error) {
      console.error('Share error:', error)
      alert('Error creating share: ' + error.message)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🔗 Share Diary</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Share Scope */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What to share?
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={shareScope === 'all'}
                  onChange={(e) => setShareScope(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800">🌟 Entire Diary</div>
                  <div className="text-xs text-gray-500">Share all categories and items</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="scope"
                  value="category"
                  checked={shareScope === 'category'}
                  onChange={(e) => setShareScope(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800">📁 Specific Category</div>
                  <div className="text-xs text-gray-500">Share only one category</div>
                </div>
              </label>
            </div>
          </div>

          {/* Category Selection */}
          {shareScope === 'category' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Choose a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Share Target Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShareTarget('email')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  shareTarget === 'email'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📧 Email
              </button>
              <button
                onClick={() => setShareTarget('userid')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  shareTarget === 'userid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👤 User ID
              </button>
            </div>
          </div>

          {/* Email or User ID Input */}
          {shareTarget === 'email' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="UUID of the user"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask the user for their User ID from their profile
              </p>
            </div>
          )}

          {/* Optional Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? '⏳ Sending...' : '✨ Send Invitation'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
