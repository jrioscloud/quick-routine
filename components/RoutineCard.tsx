import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable, Alert } from 'react-native'
import { Play, MoreVertical, Pencil, Trash2, Sun, Moon, BookOpen, Settings } from 'lucide-react-native'
import { TaskIcon } from '../lib/icons'
import { useFamilyStore } from '../store/familyStore'
import type { RoutineWithTasks } from '../types/database'

interface RoutineCardProps {
  routine: RoutineWithTasks
  onRun: () => void
  onEdit: () => void
}

const routineTypeConfig: Record<string, { badge: string; text: string; Icon: typeof Sun; color: string }> = {
  morning: { badge: 'bg-amber-100', text: 'text-amber-700', Icon: Sun, color: '#B45309' },
  evening: { badge: 'bg-blue-100', text: 'text-blue-700', Icon: Moon, color: '#1D4ED8' },
  homework: { badge: 'bg-pink-100', text: 'text-pink-700', Icon: BookOpen, color: '#BE185D' },
  custom: { badge: 'bg-gray-100', text: 'text-gray-700', Icon: Settings, color: '#374151' },
}

export default function RoutineCard({ routine, onRun, onEdit }: RoutineCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteRoutine = useFamilyStore((state) => state.deleteRoutine)

  const totalPoints = routine.tasks.reduce((sum, task) => sum + task.points, 0)
  const config = routineTypeConfig[routine.routine_type] || routineTypeConfig.custom
  const TypeIcon = config.Icon

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    const { error } = await deleteRoutine(routine.id)
    if (error) {
      Alert.alert('Error', error)
    }
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-gray-900 flex-1">{routine.name}</Text>
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              className="w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
            >
              <MoreVertical size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <View className={`flex-row items-center px-2 py-0.5 rounded ${config.badge}`}>
              <TypeIcon size={12} color={config.color} />
              <Text className={`text-xs font-medium capitalize ml-1 ${config.text}`}>
                {routine.routine_type}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 ml-2">
              {routine.tasks.length} tasks · {totalPoints} pts
            </Text>
          </View>
        </View>
      </View>

      {/* Tasks Preview */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {routine.tasks.slice(0, 3).map((task) => (
          <View key={task.id} className="flex-row items-center bg-gray-50 px-2 py-1.5 rounded-lg gap-1.5">
            <TaskIcon taskName={task.name} size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 max-w-[60px]" numberOfLines={1}>
              {task.name}
            </Text>
          </View>
        ))}
        {routine.tasks.length > 3 && (
          <View className="bg-gray-50 px-2 py-1.5 rounded-lg">
            <Text className="text-xs text-gray-500">+{routine.tasks.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Run Button */}
      <TouchableOpacity
        onPress={onRun}
        className="flex-row items-center justify-center bg-primary-500 rounded-xl py-3"
        activeOpacity={0.8}
      >
        <Play size={18} color="#fff" fill="#fff" />
        <Text className="text-white font-semibold ml-2">Start Routine</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setShowMenu(false)}
        >
          <Pressable className="absolute right-4 top-20 bg-white rounded-xl shadow-lg overflow-hidden w-40">
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
              onPress={() => {
                setShowMenu(false)
                onEdit()
              }}
              activeOpacity={0.7}
            >
              <Pencil size={18} color="#6B7280" />
              <Text className="text-gray-700 ml-3">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={() => {
                setShowMenu(false)
                setShowDeleteConfirm(true)
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color="#EF4444" />
              <Text className="text-red-500 ml-3">Delete</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => setShowDeleteConfirm(false)}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
                <Trash2 size={24} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Delete Routine?</Text>
            </View>
            <Text className="text-gray-500 text-center mb-6">
              This will permanently delete &quot;{routine.name}&quot; and all its tasks.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => setShowDeleteConfirm(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
