import { useState, useRef } from 'react'

const TagInput = ({ tags = [], onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    // If user types comma or space, add tag
    if (value.endsWith(',') || value.endsWith(' ')) {
      addTag(value.slice(0, -1))
    } else {
      setInputValue(value)
    }
  }

  // Predefined tag suggestions
  const suggestions = ['important', 'urgent', 'todo', 'done', 'work', 'personal', 'project', 'idea']
  const filteredSuggestions = suggestions.filter(
    s => !tags.includes(s) && s.includes(inputValue.toLowerCase())
  )

  return (
    <div className="space-y-2">
      {/* Tag Display and Input */}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[46px] cursor-text focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-indigo-200 rounded-full p-0.5 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>

      {/* Suggestions */}
      {inputValue && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 self-center">Suggestions:</span>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="inline-flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-indigo-50 transition"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd>,
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs mx-1">Space</kbd>, or
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Comma</kbd> to add tags
      </p>
    </div>
  )
}

export default TagInput
