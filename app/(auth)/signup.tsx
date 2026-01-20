import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuthStore } from '../../store'

export default function SignupScreen() {
  const [familyName, setFamilyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCheckEmail, setShowCheckEmail] = useState(false)
  const { signUp, isLoading } = useAuthStore()

  const handleSignup = async () => {
    if (!familyName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    const { error, needsEmailConfirmation } = await signUp(email.trim(), password, familyName.trim())

    if (error) {
      Alert.alert('Signup Failed', error)
    } else if (needsEmailConfirmation) {
      // Show check email screen - user must confirm email before accessing app
      setShowCheckEmail(true)
    } else {
      // Email confirmation disabled in Supabase - go directly to app
      router.replace('/(app)')
    }
  }

  // Check email confirmation screen
  if (showCheckEmail) {
    return (
      <View className="flex-1 bg-white justify-center px-8">
        <View className="items-center">
          <Text className="text-6xl mb-6">📧</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">Check Your Email</Text>
          <Text className="text-lg text-gray-500 text-center mb-6 leading-7">
            We sent a confirmation link to{'\n'}
            <Text className="font-semibold text-gray-700">{email}</Text>
          </Text>
          <Text className="text-base text-gray-400 text-center mb-8 leading-6">
            Click the link in the email to activate your account. After confirming, come back here and sign in.
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 px-8"
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-gray-900 mb-2">Quick Routine</Text>
            <Text className="text-lg text-gray-500">Create your family account</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Family Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
                placeholder="e.g., The Smith Family"
                placeholderTextColor="#9CA3AF"
                value={familyName}
                onChangeText={setFamilyName}
                autoCapitalize="words"
              />
            </View>

            <View className="mt-3">
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

            <View className="mt-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="mt-3">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Confirm Password</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-primary-500 rounded-2xl py-4 mt-6 shadow-md ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500 text-base">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 text-base font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
