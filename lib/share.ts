import * as Sharing from 'expo-sharing'

export async function shareImage(uri: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync()

    if (!isAvailable) {
      return { success: false, error: 'Sharing is not available on this device' }
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your achievement!',
      UTI: 'public.png',
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Share error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share image'
    }
  }
}
