import { supabase } from '../supabaseClient'

export const useBatchOperations = () => {
  const batchDelete = async (itemIds) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .in('id', itemIds)
    
    if (error) throw error
  }

  const batchMove = async (itemIds, categoryId) => {
    const { error } = await supabase
      .from('items')
      .update({ category_id: categoryId })
      .in('id', itemIds)
    
    if (error) throw error
  }

  const batchAddTags = async (itemIds, newTags) => {
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, tags')
      .in('id', itemIds)
    
    if (fetchError) throw fetchError

    const updates = items.map(item => ({
      id: item.id,
      tags: [...new Set([...(item.tags || []), ...newTags])]
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from('items')
        .update({ tags: update.tags })
        .eq('id', update.id)
      
      if (error) throw error
    }
  }

  const batchRemoveTags = async (itemIds, tagsToRemove) => {
    const { data: items, error: fetchError } = await supabase
      .from('items')
      .select('id, tags')
      .in('id', itemIds)
    
    if (fetchError) throw fetchError

    const updates = items.map(item => ({
      id: item.id,
      tags: (item.tags || []).filter(tag => !tagsToRemove.includes(tag))
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from('items')
        .update({ tags: update.tags })
        .eq('id', update.id)
      
      if (error) throw error
    }
  }

  const batchToggleFavorite = async (itemIds, setAsFavorite) => {
    const { error } = await supabase
      .from('items')
      .update({ is_favorite: setAsFavorite })
      .in('id', itemIds)
    
    if (error) throw error
  }

  const batchToggleArchive = async (itemIds, setAsArchived) => {
    const { error } = await supabase
      .from('items')
      .update({ is_archived: setAsArchived })
      .in('id', itemIds)
    
    if (error) throw error
  }

  return {
    batchDelete,
    batchMove,
    batchAddTags,
    batchRemoveTags,
    batchToggleFavorite,
    batchToggleArchive
  }
}
