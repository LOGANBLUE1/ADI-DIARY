import { supabase } from '../supabaseClient'

export const uploadImage = async (file, userId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('diary-images')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('diary-images')
    .getPublicUrl(fileName)

  return publicUrl
}

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return

  const urlParts = imageUrl.split('/diary-images/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]
  
  const { error } = await supabase.storage
    .from('diary-images')
    .remove([filePath])

  if (error) throw error
}
