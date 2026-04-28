import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function Categories() {
    const [categories, setCategories] = useState([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryDescription, setNewCategoryDescription] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchCategories()
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
                    user_id: user.id
                }
            ])

        if (error) {
            console.log(error)
            alert('Error creating category: ' + error.message)
        } else {
            setNewCategoryName('')
            setNewCategoryDescription('')
            setIsAddingCategory(false)
            fetchCategories()
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
                                onClick={() => handleCategoryClick(category.name)}
                                className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200 cursor-pointer hover:shadow-2xl transition duration-200 active:scale-95 sm:hover:scale-105 group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                        📁
                                    </div>
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-600 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate" title={category.name}>{category.name}</h3>
                                <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">{category.description || 'Click to view items'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories

