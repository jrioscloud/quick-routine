import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore, useSyncStore } from '../store'

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize)
  const setupAuthListener = useAuthStore((state) => state.setupAuthListener)
  const initializeNetworkListener = useSyncStore((state) => state.initializeNetworkListener)

  useEffect(() => {
    // Initialize auth state
    initialize()

    // Listen for auth state changes (email confirmation, token refresh, etc.)
    const unsubscribeAuth = setupAuthListener()

    // Initialize network listener for offline sync
    const unsubscribeNetwork = initializeNetworkListener()

    return () => {
      unsubscribeAuth()
      unsubscribeNetwork()
    }
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  )
}
