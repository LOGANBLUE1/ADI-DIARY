import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function Home() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data, error } = await supabase
        .from('item')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setUsers(data)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.sub_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.description && u.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">All Items</h1>
          <p className="text-gray-600">View all your diary items across categories</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by name, type, sub type, or description..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
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

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Items List
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredUsers.length} {filteredUsers.length === 1 ? 'item' : 'items'})
            </span>
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No items found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery ? 'Try a different search term' : 'Go to a category to add your first item'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u, index) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/item/${u.id}`)}
                  className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="text-lg text-gray-800">
                      <span className="font-semibold">{u.name}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-indigo-600 font-medium">{u.type}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-purple-600">{u.sub_type}</span>
                    </p>
                    {u.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{u.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {formatDate(u.created_at)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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