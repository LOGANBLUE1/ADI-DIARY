import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import ShareModal from '../components/ShareModal'

function MyShares() {
  const navigate = useNavigate()
  const [shares, setShares] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetchShares()
    fetchCategories()
  }, [])

  async function fetchShares() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setShares(data || [])
    } catch (error) {
      console.error('Error fetching shares:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function handleRevoke(shareId) {
    if (!window.confirm('Are you sure you want to revoke this share? The user will lose access immediately.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      alert('✅ Share revoked successfully')
      fetchShares()
    } catch (error) {
      console.error('Error revoking share:', error)
      alert('Error revoking share: ' + error.message)
    }
  }

  function getShareDescription(share) {
    if (share.share_type === 'all') {
      return '🌟 Entire diary'
    } else if (share.share_type === 'category') {
      return `📁 Category: ${share.category_name}`
    } else {
      return '📄 Specific item'
    }
  }

  function getStatusBadge(status) {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Accepted' },
      declined: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Declined' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📤 My Shares</h1>
              <p className="text-gray-600">Manage content you've shared with others</p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition active:scale-95"
            >
              ➕ New Share
            </button>
          </div>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{shares.length}</div>
            <div className="text-sm text-gray-600">Total Shares</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {shares.filter(s => s.status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {shares.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Shares List */}
        {shares.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-500 text-lg mb-4">No shares yet</p>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition active:scale-95"
            >
              Create Your First Share
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <div
                key={share.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {getShareDescription(share)}
                      </h3>
                      {getStatusBadge(share.status)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>
                        👤 Shared with: {share.shared_with_email || `User ID: ${share.shared_with_user_id}`}
                      </p>
                      <p>
                        📅 Created: {new Date(share.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      {share.accepted_at && (
                        <p>
                          ✅ Accepted: {new Date(share.accepted_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                    
                    {share.message && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{share.message}"</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                  >
                    🗑️ Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          fetchShares()
        }}
        shareType="all"
        categories={categories}
      />
    </div>
  )
}

export default MyShares
