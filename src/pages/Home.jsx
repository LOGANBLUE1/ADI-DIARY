import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function Home() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [filterMode, setFilterMode] = useState('OR') // 'AND' or 'OR'
  const [sortBy, setSortBy] = useState('date') // 'date' or 'tags'
  const [showArchived, setShowArchived] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data, error } = await supabase
        .from('item')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setUsers(data)
    }
  }

  // Extract all unique tags with counts
  const allTags = users.reduce((acc, item) => {
    if (item.tags && item.tags.length > 0) {
      item.tags.forEach(tag => {
        if (acc[tag]) {
          acc[tag]++
        } else {
          acc[tag] = 1
        }
      })
    }
    return acc
  }, {})

  const sortedTags = Object.entries(allTags)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([tag, count]) => ({ tag, count }))

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([])
  }

  // Filter logic
  let filteredUsers = users.filter(u => {
    // Archive filter
    if (!showArchived && u.archived) {
      return false
    }
    
    // Favorites filter
    if (showFavoritesOnly && !u.favorite) {
      return false
    }
    
    // Text search filter
    const matchesSearch = searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.sub_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.tags && u.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Tag filter
    if (selectedTags.length === 0) {
      return matchesSearch
    }

    const itemTags = u.tags || []
    const matchesTags = filterMode === 'AND'
      ? selectedTags.every(tag => itemTags.includes(tag))
      : selectedTags.some(tag => itemTags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Sort logic
  if (sortBy === 'tags') {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      const aTagCount = (a.tags || []).length
      const bTagCount = (b.tags || []).length
      return bTagCount - aTagCount
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">All Items</h1>
              <p className="text-sm sm:text-base text-gray-600">View all your diary items across categories</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 text-sm sm:text-base ${
                  showFavoritesOnly
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showFavoritesOnly ? '⭐ Favorites Only' : '⭐ Show All'}
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 text-sm sm:text-base ${
                  showArchived
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showArchived ? '📦 Showing Archived' : '📋 Show Active Only'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full px-4 py-3 pl-10 sm:pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tag Filter Cloud */}
        {sortedTags.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                🏷️ Filter by Tags
                {selectedTags.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-indigo-600">
                    ({selectedTags.length} selected)
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Filter Mode Toggle */}
                {selectedTags.length > 1 && (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFilterMode('OR')}
                      className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition ${
                        filterMode === 'OR'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      OR
                    </button>
                    <button
                      onClick={() => setFilterMode('AND')}
                      className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition ${
                        filterMode === 'AND'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      AND
                    </button>
                  </div>
                )}
                {/* Sort Toggle */}
                <button
                  onClick={() => setSortBy(sortBy === 'date' ? 'tags' : 'date')}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-200 transition"
                >
                  Sort: {sortBy === 'date' ? '📅 Date' : '🏷️ Tags'}
                </button>
                {/* Clear Filters */}
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTagFilters}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tag Cloud */}
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(({ tag, count }) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md scale-105'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-500' : 'bg-indigo-200'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Filter explanation */}
            {selectedTags.length > 1 && (
              <p className="mt-3 text-xs text-gray-500">
                {filterMode === 'OR' 
                  ? 'Showing items with ANY of the selected tags' 
                  : 'Showing items with ALL selected tags'}
              </p>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Items List
            <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
              ({filteredUsers.length} {filteredUsers.length === 1 ? 'item' : 'items'})
            </span>
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-base sm:text-lg">No items found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">
                {searchQuery ? 'Try a different search term' : 'Go to a category to add your first item'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u, index) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/item/${u.id}`)}
                  className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition duration-200 active:scale-95 sm:hover:scale-[1.02] cursor-pointer"
                >
                  {/* Image Thumbnail */}
                  {u.image_url ? (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4 rounded-lg overflow-hidden border-2 border-indigo-200">
                      <img 
                        src={u.image_url} 
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                      {index + 1}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg text-gray-800">
                      <span className="font-semibold break-words">{u.name}</span>
                      {u.favorite && (
                        <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                      {u.archived && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          📦 Archived
                        </span>
                      )}
                      <span className="text-gray-400 hidden sm:inline">|</span>
                      <span className="text-indigo-600 font-medium text-xs sm:text-sm truncate">{u.type}</span>
                      <span className="text-gray-400 hidden sm:inline">|</span>
                      <span className="text-purple-600 text-xs sm:text-sm truncate">{u.sub_type}</span>
                    </div>
                    {u.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{u.description}</p>
                    )}
                    {u.tags && u.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {u.tags.slice(0, 3).map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTag(tag)
                            }}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                              selectedTags.includes(tag)
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                        {u.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{u.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {formatDate(u.created_at)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2 sm:ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home