import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './../supabaseClient'
import TagInput from '../components/TagInput'
import { exportToJSON, exportToCSV, getExportFilename } from '../utils/exportUtils'
import { formatDateTime } from '../utils/dateUtils'
import { uploadImage, deleteImage } from '../utils/imageUtils'
import { useDropdown } from '../hooks/useDropdown'
import Dropdown, { DropdownItem } from '../components/Dropdown'

function ItemDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [subType, setSubType] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [removeExistingImage, setRemoveExistingImage] = useState(false)

    // Use custom hook
    const exportDropdown = useDropdown()

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
                setTags(data.tags || [])
            }
        }

        fetchItem()
    }, [id])

    async function toggleArchive() {
        const newArchivedState = !item.archived
        const action = newArchivedState ? 'archive' : 'unarchive'
        
        if (window.confirm(`Are you sure you want to ${action} this item?`)) {
            const { error } = await supabase
                .from('item')
                .update({ archived: newArchivedState })
                .eq('id', id)

            if (error) {
                console.error(`Error ${action}ing item:`, error)
                alert(`Error ${action}ing item: ` + error.message)
            } else {
                setItem({ ...item, archived: newArchivedState })
                alert(`Item ${newArchivedState ? 'archived' : 'unarchived'} successfully!`)
            }
        }
    }

    async function toggleFavorite() {
        const newFavoriteState = !item.favorite
        
        const { error } = await supabase
            .from('item')
            .update({ favorite: newFavoriteState })
            .eq('id', id)

        if (error) {
            console.error('Error toggling favorite:', error)
            alert('Error toggling favorite: ' + error.message)
        } else {
            setItem({ ...item, favorite: newFavoriteState })
        }
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
            setRemoveExistingImage(false)
        }
    }

    const removeNewImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
    }

    const markImageForRemoval = () => {
        setRemoveExistingImage(true)
        setSelectedImage(null)
        setImagePreview(null)
    }

    // Extract file path from image URL for deletion
    const getImagePathFromUrl = (imageUrl) => {
        if (!imageUrl) return null
        try {
            const url = new URL(imageUrl)
            const pathParts = url.pathname.split('/diary-images/')
            return pathParts[1] || null
        } catch (error) {
            console.error('Error parsing image URL:', error)
            return null
        }
    }

    async function deleteImageFromStorage(imageUrl) {
        try {
            await deleteImage(imageUrl)
        } catch (error) {
            console.error('Error deleting image from storage:', error)
        }
    }

    async function updateItem() {
        setUploading(true)
        
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('User not authenticated')
                setUploading(false)
                return
            }

            let imageUrl = item.image_url
            const oldImageUrl = item.image_url

            // Handle image removal
            if (removeExistingImage) {
                // Delete old image from storage
                if (oldImageUrl) {
                    await deleteImageFromStorage(oldImageUrl)
                }
                imageUrl = null
            }

            // Handle new image upload
            if (selectedImage) {
                // Delete old image from storage before uploading new one
                if (oldImageUrl) {
                    await deleteImageFromStorage(oldImageUrl)
                }
                imageUrl = await uploadImage(selectedImage, user.id)
            }

            const { error } = await supabase
                .from('item')
                .update({
                    name,
                    type,
                    sub_type: subType,
                    description,
                    image_url: imageUrl,
                    tags
                })
                .eq('id', id)

            if (error) {
                console.error('Error updating item:', error)
                alert('Error updating item: ' + error.message)
            } else {
                setIsEditing(false)
                setSelectedImage(null)
                setImagePreview(null)
                setRemoveExistingImage(false)
                
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
                    setTags(data.tags || [])
                }
                
                alert('Item updated successfully! ✨')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to update item. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    async function deleteItem() {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                // Delete image from storage first if exists
                if (item.image_url) {
                    await deleteImageFromStorage(item.image_url)
                }

                // Delete item from database
                const { error } = await supabase
                    .from('item')
                    .delete()
                    .eq('id', id)

                if (error) {
                    console.error('Error deleting item:', error)
                    alert('Error deleting item: ' + error.message)
                } else {
                    navigate(-1)
                }
            } catch (error) {
                console.error('Error:', error)
                alert('Failed to delete item. Please try again.')
            }
        }
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
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words flex-grow">{item.name}</h2>
                                <button
                                    onClick={toggleFavorite}
                                    className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition active:scale-95 touch-manipulation"
                                    title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill={item.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </button>
                                {item.archived && (
                                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs sm:text-sm font-semibold">
                                        📦 Archived
                                    </span>
                                )}
                            </div>
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
                                        onClick={toggleArchive}
                                        className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 touch-manipulation text-sm sm:text-base ${
                                            item.archived 
                                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}
                                    >
                                        {item.archived ? '📤 Unarchive' : '📦 Archive'}
                                    </button>
                                    <button
                                        onClick={deleteItem}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition active:scale-95 touch-manipulation text-sm sm:text-base"
                                    >
                                        🗑️ Delete
                                    </button>
                                    
                                    {/* Export Dropdown */}
                                    <Dropdown
                                        isOpen={exportDropdown.isOpen}
                                        onToggle={exportDropdown.toggle}
                                        containerRef={exportDropdown.containerRef}
                                        buttonText="📥 Export"
                                        buttonClass="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition active:scale-95 flex items-center gap-2"
                                    >
                                        <DropdownItem
                                            onClick={() => {
                                                const filename = getExportFilename(`item_${item.name.replace(/\s+/g, '_')}`, null)
                                                exportToJSON(item, filename)
                                                alert(`Exported "${item.name}" as JSON`)
                                                exportDropdown.close()
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg">📄</span>
                                                <span className="font-medium">JSON</span>
                                            </span>
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => {
                                                const filename = getExportFilename(`item_${item.name.replace(/\s+/g, '_')}`, null)
                                                exportToCSV(item, filename)
                                                alert(`Exported "${item.name}" as CSV`)
                                                exportDropdown.close()
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg">📊</span>
                                                <span className="font-medium">CSV</span>
                                            </span>
                                        </DropdownItem>
                                    </Dropdown>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={updateItem}
                                        disabled={uploading}
                                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition active:scale-95 touch-manipulation text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? '⏳ Saving...' : '💾 Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setName(item.name)
                                            setType(item.type)
                                            setSubType(item.sub_type)
                                            setDescription(item.description || '')
                                            setTags(item.tags || [])
                                            setSelectedImage(null)
                                            setImagePreview(null)
                                            setRemoveExistingImage(false)
                                        }}
                                        disabled={uploading}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition active:scale-95 touch-manipulation text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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

                                {/* Image Display */}
                                {item.image_url && (
                                    <div>
                                        <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Image</label>
                                        <div className="mt-2">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="w-full max-h-96 object-contain rounded-lg border border-gray-200 shadow-md"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tags Display */}
                                {item.tags && item.tags.length > 0 && (
                                    <div>
                                        <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {item.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                    <span>#{tag}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Created At</label>
                  <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-800 flex items-center">
                    <span className="mr-2">📅</span>
                    <span className="break-words">{formatDateTime(item.created_at)}</span>
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

                                {/* Tags Input */}
                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">\ud83c\udff7\ufe0f Tags</label>
                                    <div className="mt-2">
                                        <TagInput
                                            tags={tags}
                                            onChange={setTags}
                                            placeholder="Add tags to organize this item..."
                                        />
                                    </div>
                                </div>

                                {/* Image Edit Section */}
                                <div>
                                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 block">📷 Image</label>
                                    
                                    {/* Show existing image */}
                                    {item.image_url && !removeExistingImage && !imagePreview && (
                                        <div className="mt-2 relative">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name}
                                                className="w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm"
                                            />
                                            <div className="mt-2 flex gap-2">
                                                <label className="flex-1 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition cursor-pointer text-center text-sm">
                                                    🔄 Change Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    onClick={markImageForRemoval}
                                                    type="button"
                                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition text-sm"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show new image preview */}
                                    {imagePreview && (
                                        <div className="mt-2 relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="New preview"
                                                className="w-full max-h-64 object-contain rounded-lg border border-gray-300 shadow-sm"
                                            />
                                            <button
                                                onClick={removeNewImage}
                                                type="button"
                                                className="mt-2 w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition text-sm"
                                            >
                                                ❌ Cancel New Image
                                            </button>
                                        </div>
                                    )}

                                    {/* Show upload interface if no image */}
                                    {(!item.image_url || removeExistingImage) && !imagePreview && (
                                        <label className="mt-2 flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
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
                                    )}

                                    {removeExistingImage && !imagePreview && (
                                        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                            ⚠️ Image will be removed when you save
                                            <button
                                                onClick={() => setRemoveExistingImage(false)}
                                                type="button"
                                                className="ml-2 underline hover:no-underline"
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    )}
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
