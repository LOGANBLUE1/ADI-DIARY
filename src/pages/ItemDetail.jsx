import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'

function ItemDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [subType, setSubType] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        async function fetchItem() {
            const { data, error } = await supabase
                .from('item')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.log(error)
            } else {
                setItem(data)
                setName(data.name)
                setType(data.type)
                setSubType(data.sub_type)
                setDescription(data.description || '')
            }
        }

        fetchItem()
    }, [id])

    async function updateItem() {
        const { error } = await supabase
            .from('item')
            .update({
                name,
                type,
                sub_type: subType,
                description
            })
            .eq('id', id)

        if (error) {
            console.log(error)
        } else {
            setIsEditing(false)
            // Re-fetch to update the display
            const { data } = await supabase
                .from('item')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setItem(data)
                setName(data.name)
                setType(data.type)
                setSubType(data.sub_type)
                setDescription(data.description || '')
            }
        }
    }

    async function deleteItem() {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const { error } = await supabase
                .from('item')
                .delete()
                .eq('id', id)

            if (error) {
                console.log(error)
            } else {
                navigate(-1)
            }
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }

    if (!item) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header with Back Button */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition touch-manipulation"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm sm:text-base">Back</span>
                    </button>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">📝 Item Details</h1>
                    <p className="text-sm sm:text-base text-gray-600">View and manage this item</p>
                </div>

                {/* Item Detail Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6">
                        <div className="text-white mb-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">{item.name}</h2>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-indigo-100">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                      {item.type}
                  </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="break-words">{item.sub_type}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition active:scale-95 touch-manipulation text-sm sm:text-base"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={deleteItem}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition active:scale-95 touch-manipulation text-sm sm:text-base"
                                    >
                                        🗑️ Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={updateItem}
                                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition active:scale-95 touch-manipulation text-sm sm:text-base"
                                    >
                                        💾 Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setName(item.name)
                                            setType(item.type)
                                            setSubType(item.sub_type)
                                            setDescription(item.description || '')
                                        }}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition active:scale-95 touch-manipulation text-sm sm:text-base"
                                    >
                                        ❌ Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-6">
                        {!isEditing ? (
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                                    <p className="mt-2 text-base sm:text-lg text-gray-800 break-words">{item.name}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                                    <p className="mt-2 text-base sm:text-lg text-gray-800 break-words">{item.type}</p>
                                  </div>

                                  <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Sub Type</label>
                                    <p className="mt-2 text-base sm:text-lg text-gray-800 break-words">{item.sub_type}</p>
                                  </div>
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                                    <div className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        {item.description ? (
                                            <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap break-words">{item.description}</p>
                                        ) : (
                                            <p className="text-sm sm:text-base text-gray-400 italic">No description provided</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Created At</label>
                  <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-800 flex items-center">
                    <span className="mr-2">📅</span>
                    <span className="break-words">{formatDate(item.created_at)}</span>
                  </p>
                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Type</label>
                                        <input
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Sub Type</label>
                                        <input
                                            value={subType}
                                            onChange={(e) => setSubType(e.target.value)}
                                            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none text-sm sm:text-base"
                                        placeholder="Enter item description..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetail
