import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function Categories() {
    const [categories, setCategories] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        const { data, error } = await supabase
            .from('item')
            .select('type')

        if (error) {
            console.log(error)
        } else {
            // Get unique categories
            const uniqueCategories = [...new Set(data.map(item => item.type).filter(Boolean))]
            setCategories(uniqueCategories)
        }
    }

    const handleCategoryClick = (category) => {
        navigate(`/category/${encodeURIComponent(category)}`)
    }

    const handleAllCategories = () => {
        navigate('/all')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">📚 Select a Category</h1>
                    <p className="text-sm sm:text-base text-gray-600 px-2">Choose a category to view or add items</p>
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
                        <p className="text-gray-400 text-xs sm:text-sm">Create your first item to see categories here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                onClick={() => handleCategoryClick(category)}
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
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate" title={category}>{category}</h3>
                                <p className="text-gray-500 text-xs sm:text-sm">Click to view items</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Categories

