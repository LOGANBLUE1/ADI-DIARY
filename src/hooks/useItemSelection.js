import { useState } from 'react'

export const useItemSelection = () => {
  const [selectedItems, setSelectedItems] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)

  const toggleSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAll = (itemIds) => {
    setSelectedItems(itemIds)
  }

  const clearSelection = () => {
    setSelectedItems([])
    setSelectionMode(false)
  }

  const toggleSelectionMode = () => {
    if (selectionMode) {
      clearSelection()
    } else {
      setSelectionMode(true)
    }
  }

  return {
    selectedItems,
    selectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectionMode,
    setSelectionMode
  }
}
