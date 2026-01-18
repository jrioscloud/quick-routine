import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../store'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

export default function AuthLayout() {
  const { user, isLoading, isInitialized } = useAuthStore()

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  // Redirect to app if already authenticated
  if (user) {
    return <Redirect href="/(app)" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
})
