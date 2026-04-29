import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'
import TagInput from '../components/TagInput'

function CategoryItems() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [categoryIcon, setCategoryIcon] = useState('📁')
  const [name, setName] = useState('')
  const [subType, setSubType] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [filterMode, setFilterMode] = useState('OR') // 'AND' or 'OR'
  const [sortBy, setSortBy] = useState('date') // 'date' or 'tags'
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Fetch category icon
      const { data: categoryData } = await supabase
        .from('categories')
        .select('icon')
        .eq('name', category)
        .eq('user_id', user.id)
        .single()

      if (categoryData?.icon) {
        setCategoryIcon(categoryData.icon)
      }

      // Fetch items
      const { data, error } = await supabase
        .from('item')
        .select('*')
        .eq('type', category)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.log(error)
      } else {
        setItems(data)
      }
    }

    fetchData()
  }, [category])

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  async function uploadImage(userId) {
    if (!selectedImage) return null

    const fileExt = selectedImage.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('diary-images')
      .upload(fileName, selectedImage)

    if (error) {
      console.error('Error uploading image:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('diary-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  async function addItem() {
    if (!name) {
      alert('Please enter a name for the item')
      return
    }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('User not authenticated')
      setUploading(false)
      return
    }

    try {
      // Upload image if selected
      let imageUrl = null
      if (selectedImage) {
        imageUrl = await uploadImage(user.id)
      }

      const { error } = await supabase
        .from('item')
        .insert([
          {
            name,
            type: category,
            sub_type: subType,
            description,
            user_id: user.id,
            image_url: imageUrl,
            tags
          }
        ])

      if (error) {
        console.error('Error adding item:', error)
        alert(`Error creating item: ${error.message}\n\nHave you run the database migration SQL commands? Check the console for details.`)
      } else {
        setName('')
        setSubType('')
        setDescription('')
        setTags([])
        removeImage()
        alert('Item created successfully! ✨')
        // Re-fetch items after adding
        const { data } = await supabase
          .from('item')
          .select('*')
          .eq('type', category)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (data) setItems(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create item. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Extract all unique tags with counts
  const allTags = items.reduce((acc, item) => {
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
  let filteredItems = items.filter(item => {
    // Text search filter
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sub_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Tag filter
    if (selectedTags.length === 0) {
      return matchesSearch
    }

    const itemTags = item.tags || []
    const matchesTags = filterMode === 'AND'
      ? selectedTags.every(tag => itemTags.includes(tag))
      : selectedTags.some(tag => itemTags.includes(tag))

    return matchesSearch && matchesTags
  })

  // Sort logic
  if (sortBy === 'tags') {
    filteredItems = [...filteredItems].sort((a, b) => {
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
        {/* Header with Back Button */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition touch-manipulation"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base">Back to Categories</span>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 break-words">{categoryIcon} {category}</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage items in this category</p>
        </div>

        {/* Add Item Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Add New Item</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
            <input
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              placeholder="Sub Type"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none mb-3 sm:mb-4 text-sm sm:text-base"
          />
          
          {/* Tags Input */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Tags (optional)
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add tags to organize this item..."
            />
          </div>
          
          {/* Image Upload Section */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Add Image (optional)
            </label>
            
            {!imagePreview ? (
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={addItem}
            disabled={uploading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Uploading...' : '✨ Add Item'}
          </button>
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
            Items
            <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
              ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
            </span>
          </h2>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-base sm:text-lg">No items found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 px-4">
                {searchQuery ? 'Try a different search term' : 'Add your first item to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:shadow-md transition duration-200 active:scale-95 sm:hover:scale-[1.02] cursor-pointer"
                >
                  {/* Image Thumbnail */}
                  {item.image_url ? (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4 rounded-lg overflow-hidden border-2 border-indigo-200">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
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
                      <span className="font-semibold break-words">{item.name}</span>
                      <span className="text-gray-400 hidden sm:inline">|</span>
                      <span className="text-purple-600 text-xs sm:text-sm truncate">{item.sub_type}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag, idx) => (
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
                        {item.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {formatDate(item.created_at)}
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

export default CategoryItems
