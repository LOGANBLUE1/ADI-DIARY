import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function Categories() {
    const [categories, setCategories] = useState([])
    const [categoryCounts, setCategoryCounts] = useState({})
    const [totalItems, setTotalItems] = useState(0)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryDescription, setNewCategoryDescription] = useState('')
    const [newCategoryIcon, setNewCategoryIcon] = useState('📁')
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const navigate = useNavigate()

    // Popular emoji options for categories
    const emojiOptions = [
        '📁', '📚', '✈️', '🍔', '💼', '🏠', '🎮', '🎵',
        '🎨', '💪', '🏃', '📝', '💻', '📱', '🎬', '📷',
        '🌟', '❤️', '🎉', '🎓', '🏆', '💡', '🔧', '🛒',
        '🌺', '🌈', '☕', '🍕', '🎯', '🚀', '⚽', '🎸'
    ]

    useEffect(() => {
        fetchCategories()
        fetchItemCounts()
    }, [])

    async function fetchCategories() {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.log(error)
        } else {
            setCategories(data || [])
        }
    }

    async function fetchItemCounts() {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // Fetch all items for this user
        const { data: items, error } = await supabase
            .from('item')
            .select('type')
            .eq('user_id', user.id)

        if (error) {
            console.log(error)
        } else {
            // Count items per category
            const counts = {}
            items?.forEach(item => {
                counts[item.type] = (counts[item.type] || 0) + 1
            })
            setCategoryCounts(counts)
            setTotalItems(items?.length || 0)
        }
    }

    async function addCategory() {
        if (!newCategoryName.trim()) return

        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        const { error } = await supabase
            .from('categories')
            .insert([
                {
                    name: newCategoryName.trim(),
                    description: newCategoryDescription.trim(),
                    icon: newCategoryIcon,
                    user_id: user.id
                }
            ])

        if (error) {
            console.log(error)
            alert('Error creating category: ' + error.message)
        } else {
            setNewCategoryName('')
            setNewCategoryDescription('')
            setNewCategoryIcon('📁')
            setIsAddingCategory(false)
            fetchCategories()
            fetchItemCounts()
        }
    }

    async function deleteCategory(categoryId, categoryName, e) {
        e.stopPropagation() // Prevent navigation when clicking delete
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if category has items
        const { data: items, error: itemsError } = await supabase
            .from('item')
            .select('id')
            .eq('type', categoryName)
            .eq('user_id', user.id)

        if (itemsError) {
            console.error('Error checking items:', itemsError)
            alert('Error checking category items')
            return
        }

        const itemCount = items?.length || 0
        
        let confirmMessage = `Are you sure you want to delete "${categoryName}"?`
        if (itemCount > 0) {
            confirmMessage = `This category contains ${itemCount} item${itemCount > 1 ? 's' : ''}. Deleting this category will NOT delete the items, but they will become uncategorized. Continue?`
        }

        if (window.confirm(confirmMessage)) {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId)
                .eq('user_id', user.id)

            if (error) {
                console.error('Error deleting category:', error)
                alert('Error deleting category: ' + error.message)
            } else {
                fetchCategories()
                fetchItemCounts()
            }
        }
    }

    const handleCategoryClick = (categoryName) => {
        navigate(`/category/${encodeURIComponent(categoryName)}`)
    }

    const handleAllCategories = () => {
        navigate('/all')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">📚 My Categories</h1>
                    <p className="text-sm sm:text-base text-gray-600 px-2">Choose a category to view or add items</p>
                </div>

                {/* Add Category Button/Form */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
                    {!isAddingCategory ? (
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105 touch-manipulation"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create New Category</span>
                        </button>
                    ) : (
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Create New Category</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {/* Emoji Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Choose an Icon
                                    </label>
                                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                                        {emojiOptions.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setNewCategoryIcon(emoji)}
                                                className={`text-2xl sm:text-3xl p-2 sm:p-3 rounded-lg transition duration-200 hover:scale-110 ${
                                                    newCategoryIcon === emoji
                                                        ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-md'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category Name (e.g., Travel, Books, Recipes)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                                    autoFocus
                                />
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-sm sm:text-base"
                                />
                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={addCategory}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base"
                                    >
                                        ✨ Create
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingCategory(false)
                                            setNewCategoryName('')
                                            setNewCategoryDescription('')
                                            setNewCategoryIcon('📁')
                                        }}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 active:scale-95 text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* All Categories Card */}
                <div
                    onClick={handleAllCategories}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 border border-indigo-200 cursor-pointer hover:shadow-2xl transition duration-200 active:scale-95 sm:hover:scale-[1.02]"
                >
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">🌟 All Categories</h2>
                            <p className="text-sm sm:text-base text-indigo-100">View and manage all your items</p>
                            {totalItems > 0 && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                    </svg>
                                    <span className="font-semibold text-sm">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                                </div>
                            )}
                        </div>
                        <svg className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 border border-gray-200 text-center">
                        <div className="text-4xl sm:text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-base sm:text-lg mb-2">No categories yet</p>
                        <p className="text-gray-400 text-xs sm:text-sm">Create your first category to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200 cursor-pointer hover:shadow-2xl transition duration-200 active:scale-95 sm:hover:scale-105 group relative"
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => deleteCategory(category.id, category.name, e)}
                                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 z-10"
                                    title="Delete category"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Category Content */}
                                <div onClick={() => handleCategoryClick(category.name)}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                            {category.icon || '📁'}
                                        </div>
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate" title={category.name}>{category.name}</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">{category.description || 'Click to view items'}</p>
                                    {/* Item Count Badge */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                            </svg>
                                            <span>{categoryCounts[category.name] || 0} {(categoryCounts[category.name] || 0) === 1 ? 'item' : 'items'}</span>
                                        </div>
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

export default Categories

