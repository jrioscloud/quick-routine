import { TouchableOpacity, View, Text } from 'react-native'
import { Check } from 'lucide-react-native'
import { TaskIcon } from '../lib/icons'
import type { Task } from '../types/database'

interface TaskItemProps {
  task: Task
  isCompleted: boolean
  onToggle: () => void
}

export default function TaskItem({ task, isCompleted, onToggle }: TaskItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-xl p-4 mb-3 border-2 ${
        isCompleted
          ? 'bg-primary-50 border-primary-500'
          : 'bg-white border-gray-200'
      }`}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <View
        className={`w-7 h-7 rounded-full border-2 items-center justify-center mr-3 ${
          isCompleted
            ? 'bg-primary-500 border-primary-500'
            : 'border-gray-300'
        }`}
      >
        {isCompleted && <Check size={16} color="#fff" strokeWidth={3} />}
      </View>

      {/* Icon */}
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
        isCompleted ? 'bg-primary-100' : 'bg-gray-100'
      }`}>
        <TaskIcon
          taskName={task.name}
          size={22}
          color={isCompleted ? '#059669' : '#6B7280'}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold mb-0.5 ${
            isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {task.name}
        </Text>
        <Text className={`text-sm font-medium ${isCompleted ? 'text-primary-400' : 'text-primary-500'}`}>
          +{task.points} pts
        </Text>
      </View>
    </TouchableOpacity>
  )
}
