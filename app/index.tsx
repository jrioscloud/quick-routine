import { Redirect } from 'expo-router'
import { useAuthStore } from '../store'

export default function Index() {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return null
  }

  if (user) {
    return <Redirect href="/(app)" />
  }

  return <Redirect href="/(auth)/login" />
}
