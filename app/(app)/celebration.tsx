import { useRef, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Trophy, Star, Clock, Target, CheckCircle, Share2 } from 'lucide-react-native'
import ViewShot from 'react-native-view-shot'
import { ShareImage } from '../../components'
import { shareImage } from '../../lib/share'

export default function CelebrationScreen() {
  const params = useLocalSearchParams<{
    duration: string
    points: string
    tasksCompleted: string
    totalTasks: string
    queuedOffline: string
    routineName: string
    childName: string
  }>()

  const [isSharing, setIsSharing] = useState(false)
  const shareRef = useRef<ViewShot>(null)

  const duration = parseInt(params.duration || '0', 10)
  const points = parseInt(params.points || '0', 10)
  const tasksCompleted = parseInt(params.tasksCompleted || '0', 10)
  const totalTasks = parseInt(params.totalTasks || '0', 10)
  const queuedOffline = params.queuedOffline === 'true'
  const routineName = params.routineName || 'Routine'
  const childName = params.childName || 'Child'

  // Format duration as MM:SS
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  const durationDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Determine celebration message based on performance
  const allTasksCompleted = tasksCompleted === totalTasks
  const title = allTasksCompleted ? 'Amazing!' : 'Great effort!'
  const subtitle = allTasksCompleted
    ? 'You completed all your tasks!'
    : `You finished ${tasksCompleted} of ${totalTasks} tasks`

  const handleShare = async () => {
    if (!shareRef.current?.capture) {
      Alert.alert('Error', 'Unable to capture image')
      return
    }

    setIsSharing(true)

    try {
      const uri = await shareRef.current.capture()
      const { error } = await shareImage(uri)

      if (error) {
        Alert.alert('Share Failed', error)
      }
    } catch {
      Alert.alert('Error', 'Failed to share achievement')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Hidden share image capture */}
      <ShareImage
        ref={shareRef}
        childName={childName}
        routineName={routineName}
        duration={durationDisplay}
        points={points}
        tasksCompleted={tasksCompleted}
        totalTasks={totalTasks}
      />

      {/* Offline sync banner */}
      {queuedOffline && (
        <View className="bg-amber-100 py-3 px-4 items-center">
          <Text className="text-amber-800 text-sm font-medium">
            Data will sync when you&apos;re back online
          </Text>
        </View>
      )}

      <View className="flex-1 justify-center items-center p-6">
        {/* Celebration icon */}
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
          allTasksCompleted ? 'bg-primary-500' : 'bg-amber-500'
        }`}>
          {allTasksCompleted ? (
            <Trophy size={48} color="#fff" />
          ) : (
            <Star size={48} color="#fff" />
          )}
        </View>

        {/* Title */}
        <Text className="text-4xl font-bold text-primary-800 mb-2">{title}</Text>
        <Text className="text-lg text-primary-600 text-center mb-8">{subtitle}</Text>

        {/* Stats */}
        <View className="flex-row bg-white rounded-2xl p-5 mb-8 shadow-md">
          <View className="items-center px-5">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
              <Clock size={20} color="#2563EB" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{durationDisplay}</Text>
            <Text className="text-sm text-gray-500">Time</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center px-5">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mb-2">
              <Star size={20} color="#D97706" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{points}</Text>
            <Text className="text-sm text-gray-500">Points</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center px-5">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mb-2">
              <CheckCircle size={20} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{tasksCompleted}/{totalTasks}</Text>
            <Text className="text-sm text-gray-500">Tasks</Text>
          </View>
        </View>

        {/* Share button */}
        <TouchableOpacity
          className={`flex-row items-center bg-white rounded-xl py-3.5 px-8 mb-4 border-2 border-primary-500 ${isSharing ? 'opacity-70' : ''}`}
          onPress={handleShare}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          {isSharing ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#10B981" size="small" />
              <Text className="text-primary-500 text-base font-semibold">Preparing...</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Share2 size={20} color="#10B981" />
              <Text className="text-primary-500 text-base font-semibold">Share Achievement</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Done button */}
        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3.5 px-12"
          onPress={() => router.replace('/(app)')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
