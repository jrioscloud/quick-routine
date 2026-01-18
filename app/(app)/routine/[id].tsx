import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { X, AlertTriangle, Clock } from 'lucide-react-native'
import { Timer, TaskItem } from '../../../components'
import { useSessionStore } from '../../../store/sessionStore'
import { useFamilyStore } from '../../../store/familyStore'

export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [isStarting, setIsStarting] = useState(false)
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [showTimeUpModal, setShowTimeUpModal] = useState(false)

  // Session store
  const activeSession = useSessionStore((state) => state.activeSession)
  const isLoading = useSessionStore((state) => state.isLoading)
  const startSession = useSessionStore((state) => state.startSession)
  const toggleTask = useSessionStore((state) => state.toggleTask)
  const completeSession = useSessionStore((state) => state.completeSession)
  const abandonSession = useSessionStore((state) => state.abandonSession)

  // Family store
  const routines = useFamilyStore((state) => state.routines)
  const children = useFamilyStore((state) => state.children)
  const selectedChildId = useFamilyStore((state) => state.selectedChildId)

  // Find the routine and child
  const routine = routines.find((r) => r.id === id)
  const selectedChild = children.find((c) => c.id === selectedChildId)

  // Start session if not already active
  useEffect(() => {
    const initSession = async () => {
      if (!routine || !selectedChildId || activeSession || isStarting) return

      setIsStarting(true)
      const { error } = await startSession(routine.id, selectedChildId, routine.tasks)
      setIsStarting(false)

      if (error) {
        // Show error and go back
        setShowAbandonModal(false)
        router.back()
      }
    }

    initSession()
  }, [routine, selectedChildId, activeSession, startSession, isStarting])

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setShowTimeUpModal(true)
  }, [])

  // Handle routine completion
  const handleComplete = useCallback(async () => {
    const { error, session, queuedOffline } = await completeSession()
    if (error) {
      return
    }

    // Navigate to celebration with session data
    router.replace({
      pathname: '/(app)/celebration',
      params: {
        duration: session?.duration_seconds?.toString() || '0',
        points: session?.points_earned?.toString() || '0',
        tasksCompleted: activeSession?.completedTaskIds.length.toString() || '0',
        totalTasks: activeSession?.tasks.length.toString() || '0',
        queuedOffline: queuedOffline ? 'true' : 'false',
        routineName: routine?.name || 'Routine',
        childName: selectedChild?.name || 'Child',
      },
    })
  }, [completeSession, activeSession, routine, selectedChild])

  // Handle abandon confirmation
  const handleConfirmAbandon = useCallback(async () => {
    setShowAbandonModal(false)
    await abandonSession()
    router.back()
  }, [abandonSession])

  // Loading state
  if (isStarting || !activeSession) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-base text-gray-500">Starting routine...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Calculate progress
  const completedCount = activeSession.completedTaskIds.length
  const totalCount = activeSession.tasks.length
  const allTasksCompleted = completedCount === totalCount

  // Calculate potential points
  const totalPoints = activeSession.tasks.reduce((sum, t) => sum + t.points, 0)
  const earnedPoints = activeSession.tasks
    .filter((t) => activeSession.completedTaskIds.includes(t.id))
    .reduce((sum, t) => sum + t.points, 0)

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setShowAbandonModal(true)}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">{routine?.name || 'Routine'}</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Timer */}
        <Timer onComplete={handleTimerComplete} />

        {/* Progress */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {completedCount} of {totalCount} tasks done
          </Text>
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </View>
          <Text className="text-sm text-primary-500 font-medium mt-2">
            {earnedPoints} / {totalPoints} points
          </Text>
        </View>

        {/* Tasks */}
        <View className="flex-1">
          {activeSession.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isCompleted={activeSession.completedTaskIds.includes(task.id)}
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${allTasksCompleted ? 'bg-primary-500' : 'bg-gray-400'}`}
          onPress={handleComplete}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              {allTasksCompleted ? 'Complete Routine!' : `End routine · ${totalCount - completedCount} to go`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Abandon Confirmation Modal */}
      <Modal
        visible={showAbandonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbandonModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => setShowAbandonModal(false)}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
                <AlertTriangle size={24} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Abandon Routine?</Text>
            </View>
            <Text className="text-gray-500 text-center mb-6">
              Are you sure you want to stop? Your progress will be saved.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => setShowAbandonModal(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                onPress={handleConfirmAbandon}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Abandon</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Time's Up Modal */}
      <Modal
        visible={showTimeUpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeUpModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => setShowTimeUpModal(false)}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-amber-100 items-center justify-center mb-3">
                <Clock size={32} color="#D97706" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Time is Up!</Text>
            </View>
            <Text className="text-gray-500 text-center mb-6">
              The timer has finished. You can still complete your tasks.
            </Text>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-3 items-center"
              onPress={() => setShowTimeUpModal(false)}
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">Continue</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
