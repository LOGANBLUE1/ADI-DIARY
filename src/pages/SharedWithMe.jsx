import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function SharedWithMe() {
  const navigate = useNavigate()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'accepted'

  useEffect(() => {
    fetchShares()
  }, [activeTab])

  async function fetchShares() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shares')
        .select(`
          *,
          owner:owner_id (email)
        `)
        .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`)
        .eq('status', activeTab)
        .order('created_at', { ascending: false })

      if (error) throw error

      setShares(data || [])
    } catch (error) {
      console.error('Error fetching shares:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(shareId) {
    try {
      const { error } = await supabase
        .from('shares')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', shareId)

      if (error) throw error

      alert('✅ Share accepted! You can now view the shared content.')
      fetchShares()
    } catch (error) {
      console.error('Error accepting share:', error)
      alert('Error accepting share: ' + error.message)
    }
  }

  async function handleDecline(shareId) {
    if (!window.confirm('Are you sure you want to decline this share invitation?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shares')
        .update({ status: 'declined' })
        .eq('id', shareId)

      if (error) throw error

      alert('Share invitation declined')
      fetchShares()
    } catch (error) {
      console.error('Error declining share:', error)
      alert('Error declining share: ' + error.message)
    }
  }

  async function handleRemove(shareId) {
    if (!window.confirm('Remove access to this shared content?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      alert('Access removed')
      fetchShares()
    } catch (error) {
      console.error('Error removing share:', error)
      alert('Error removing share: ' + error.message)
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🤝 Shared With Me</h1>
          <p className="text-gray-600">View and manage diaries shared with you</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏳ Pending Invitations
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              activeTab === 'accepted'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ Accepted Shares
          </button>
        </div>

        {/* Shares List */}
        {shares.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'pending' ? '📬' : '📭'}
            </div>
            <p className="text-gray-500 text-lg">
              {activeTab === 'pending' 
                ? 'No pending share invitations' 
                : 'No accepted shares yet'}
            </p>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        share.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {share.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      👤 Shared by: {share.owner?.email || 'Unknown user'}
                    </p>
                    
                    {share.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 italic">"{share.message}"</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Shared on: {new Date(share.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAccept(share.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleDecline(share.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                        >
                          ✕ Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            // Navigate to view shared content
                            if (share.share_type === 'all') {
                              navigate(`/shared/${share.owner_id}/all`)
                            } else if (share.share_type === 'category') {
                              navigate(`/shared/${share.owner_id}/category/${share.category_name}`)
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleRemove(share.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SharedWithMe
