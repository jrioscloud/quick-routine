import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useFamilyStore } from '../store'

export default function ChildSelector() {
  const { children, selectedChildId, selectChild } = useFamilyStore()

  if (children.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text className="text-sm text-gray-500">No children added yet</Text>
      </View>
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
    >
      {children.map((child) => {
        const isSelected = child.id === selectedChildId
        return (
          <TouchableOpacity
            key={child.id}
            className={`items-center p-3 rounded-2xl border-2 min-w-[90px] ${
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
            onPress={() => selectChild(child.id)}
            activeOpacity={0.7}
          >
            <View
              className={`w-14 h-14 rounded-full justify-center items-center mb-2 ${
                isSelected ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {child.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className={`text-sm font-semibold ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}>
              {child.name}
            </Text>
            <Text className={`text-xs mt-0.5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
              {child.age} years
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}
