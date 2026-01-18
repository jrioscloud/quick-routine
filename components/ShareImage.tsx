import { forwardRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Trophy, Star, Clock, CheckCircle } from 'lucide-react-native'
import ViewShot from 'react-native-view-shot'

interface ShareImageProps {
  childName: string
  routineName: string
  duration: string
  points: number
  tasksCompleted: number
  totalTasks: number
}

const ShareImage = forwardRef<ViewShot, ShareImageProps>(
  ({ childName, routineName, duration, points, tasksCompleted, totalTasks }, ref) => {
    const allTasksCompleted = tasksCompleted === totalTasks

    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1 }}
        style={styles.container}
      >
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-semibold text-primary-500">Quick Routine</Text>
            <View className={`w-12 h-12 rounded-full items-center justify-center ${
              allTasksCompleted ? 'bg-primary-500' : 'bg-amber-500'
            }`}>
              {allTasksCompleted ? (
                <Trophy size={24} color="#fff" />
              ) : (
                <Star size={24} color="#fff" />
              )}
            </View>
          </View>

          {/* Achievement */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary-800 mb-2">{childName}</Text>
            <Text className="text-lg text-gray-500 mb-1">
              {allTasksCompleted ? 'completed' : 'worked on'}
            </Text>
            <Text className="text-2xl font-semibold text-gray-900">{routineName}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row bg-gray-50 rounded-2xl p-5 mb-6">
            <View className="flex-1 items-center">
              <Clock size={20} color="#2563EB" />
              <Text className="text-2xl font-bold text-gray-900 mt-2 mb-1">{duration}</Text>
              <Text className="text-sm text-gray-500">Time</Text>
            </View>
            <View className="w-px bg-gray-200 mx-2" />
            <View className="flex-1 items-center">
              <Star size={20} color="#D97706" />
              <Text className="text-2xl font-bold text-gray-900 mt-2 mb-1">{points}</Text>
              <Text className="text-sm text-gray-500">Points</Text>
            </View>
            <View className="w-px bg-gray-200 mx-2" />
            <View className="flex-1 items-center">
              <CheckCircle size={20} color="#059669" />
              <Text className="text-2xl font-bold text-gray-900 mt-2 mb-1">{tasksCompleted}/{totalTasks}</Text>
              <Text className="text-sm text-gray-500">Tasks</Text>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center">
            <Text className="text-base font-medium text-gray-400 italic">One. Two. Done.</Text>
          </View>
        </View>
      </ViewShot>
    )
  }
)

ShareImage.displayName = 'ShareImage'

export default ShareImage

// Keep styles for positioning (off-screen capture) and fixed dimensions
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -1000,
    top: -1000,
    width: 400,
    backgroundColor: '#ECFDF5',
    padding: 24,
  },
})
