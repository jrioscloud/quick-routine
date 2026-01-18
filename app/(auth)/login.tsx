import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuthStore } from '../../store'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, isLoading } = useAuthStore()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const { error } = await signIn(email.trim(), password)

    if (error) {
      Alert.alert('Login Failed', error)
    } else {
      router.replace('/(app)')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary-500 rounded-3xl items-center justify-center mb-6 shadow-lg">
            <Text className="text-4xl">✓</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 mb-2">Quick Routine</Text>
          <Text className="text-lg text-gray-500">Welcome back!</Text>
        </View>

        {/* Form */}
        <View className="space-y-5">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Password</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className={`bg-primary-500 rounded-2xl py-4 mt-6 shadow-md ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">Don&apos;t have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 text-base font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
