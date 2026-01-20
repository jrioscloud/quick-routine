import { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { ClipboardList, CloudOff } from 'lucide-react-native'
import { useAuthStore, useFamilyStore, useSyncStore } from '../../store'
import ChildSelector from '../../components/ChildSelector'
import RoutineCard from '../../components/RoutineCard'

export default function HomeScreen() {
  const { family, signOut } = useAuthStore()
  const { children, routines, selectedChildId, fetchChildren, fetchRoutines, isLoading } =
    useFamilyStore()
  const { pendingOperations, isOnline } = useSyncStore()

  useEffect(() => {
    if (family?.id) {
      fetchChildren(family.id)
      fetchRoutines(family.id)
    }
  }, [family?.id])

  // Session recovery is handled by the modal in _layout.tsx

  const handleRefresh = () => {
    if (family?.id) {
      fetchChildren(family.id)
      fetchRoutines(family.id)
    }
  }

  const handleRunRoutine = (routineId: string) => {
    if (!selectedChildId) return
    router.push(`/(app)/routine/${routineId}`)
  }

  const handleEditRoutine = (routineId: string) => {
    router.push(`/(app)/suggest?editId=${routineId}`)
  }

  const handleSuggestRoutine = () => {
    router.push('/(app)/suggest')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <View>
          <Text className="text-sm text-gray-500">Hello,</Text>
          <Text className="text-2xl font-bold text-gray-900">{family?.name || 'Family'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="p-2">
          <Text className="text-sm font-medium text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Offline/Sync Status Banner */}
      {(!isOnline || pendingOperations.length > 0) && (
        <View className="flex-row items-center justify-center gap-2 bg-amber-100 py-2 px-4">
          <CloudOff size={16} color="#92400E" />
          <Text className="text-amber-800 text-sm font-medium">
            {!isOnline
              ? 'You are offline'
              : `${pendingOperations.length} item${pendingOperations.length > 1 ? 's' : ''} pending sync`}
          </Text>
        </View>
      )}

      {/* Child Selector */}
      <View className="px-6 py-4 bg-white">
        <Text className="text-base font-semibold text-gray-700 mb-3">
          {children.length > 0 ? 'Select Child' : 'Add a Child'}
        </Text>
        <ChildSelector />
      </View>

      {/* Routines */}
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-700">Routines</Text>
          <TouchableOpacity onPress={handleSuggestRoutine}>
            <Text className="text-sm font-semibold text-primary-500">+ Add</Text>
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
              <ClipboardList size={40} color="#10B981" />
            </View>
            <Text className="text-xl font-semibold text-gray-700 mb-2">No routines yet</Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
              Create your first routine using AI suggestions!
            </Text>
            <TouchableOpacity
              className="bg-primary-500 rounded-2xl py-3 px-8 shadow-md"
              onPress={handleSuggestRoutine}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">Create Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RoutineCard
                routine={item}
                onRun={() => handleRunRoutine(item.id)}
                onEdit={() => handleEditRoutine(item.id)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor="#10B981"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}
