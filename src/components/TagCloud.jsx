const TagCloud = ({ tags, selectedTags, onTagClick, showCounts = false }) => {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.tag)
        return (
          <button
            key={tag.tag}
            onClick={() => onTagClick(tag.tag)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tag.tag}
            {showCounts && ` (${tag.count})`}
          </button>
        )
      })}
    </div>
  )
}

export default TagCloud
