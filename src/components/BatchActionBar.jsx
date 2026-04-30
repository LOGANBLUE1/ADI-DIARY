const BatchActionBar = ({
  selectedCount,
  onCancel,
  onSelectAll,
  onDelete,
  onMove,
  onAddTags,
  onRemoveTags,
  onFavorite,
  onUnfavorite,
  onArchive,
  onUnarchive,
  categories = null
}) => {
  return (
    <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-indigo-900">
          {selectedCount} selected
        </span>
        
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Cancel
        </button>

        {onSelectAll && (
          <button
            onClick={onSelectAll}
            className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            Select All
          </button>
        )}

        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Delete
        </button>

        {categories && (
          <select
            onChange={(e) => onMove(e.target.value)}
            className="px-3 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>Move to Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onAddTags}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add Tags
        </button>

        <button
          onClick={onRemoveTags}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          Remove Tags
        </button>

        <button
          onClick={onFavorite}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          ⭐ Favorite
        </button>

        <button
          onClick={onUnfavorite}
          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
        >
          Unfavorite
        </button>

        <button
          onClick={onArchive}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          📦 Archive
        </button>

        <button
          onClick={onUnarchive}
          className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
        >
          Unarchive
        </button>
      </div>
    </div>
  )
}

export default BatchActionBar
