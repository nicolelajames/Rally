import { supabase } from './supabase'
import { parseDocumentImage } from './anthropic'

export async function processDocument(
  file: File,
  familyId: string,
  childId: string
): Promise<{ summary: string; itemCount: number }> {
  // 1. Read file as base64
  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  // 2. Upload to Supabase Storage
  const filePath = `${familyId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // 3. Call Anthropic API to extract items
  let result
  try {
    result = await parseDocumentImage(base64, mimeType)
  } catch (firstErr) {
    // Retry once on parse failure
    try {
      result = await parseDocumentImage(base64, mimeType)
    } catch {
      // Save document record even if extraction fails
      await supabase.from('documents').insert({
        family_id: familyId,
        child_id: childId,
        file_path: filePath,
        file_name: file.name,
        feed_items_created: 0,
      })
      throw firstErr
    }
  }

  // 4. Insert feed items
  const feedItems = result.items.map((item) => ({
    family_id: familyId,
    child_id: childId,
    type: item.type,
    priority: item.priority,
    title: item.title,
    description: item.description,
    due_at: item.due_at,
    event_at: item.event_at,
    location: item.location,
    badge_type: item.badge_type,
    badge_label: item.badge_label,
    source_label: `Scanned document — ${file.name}`,
    is_done: false,
  }))

  if (feedItems.length > 0) {
    const { error: insertError } = await supabase
      .from('feed_items')
      .insert(feedItems)
    if (insertError) {
      throw new Error(`Failed to save items: ${insertError.message}`)
    }
  }

  // 5. Save document record
  await supabase.from('documents').insert({
    family_id: familyId,
    child_id: childId,
    file_path: filePath,
    file_name: file.name,
    ai_summary: result.summary,
    feed_items_created: feedItems.length,
  })

  return { summary: result.summary, itemCount: feedItems.length }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Remove the data:mime;base64, prefix
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
