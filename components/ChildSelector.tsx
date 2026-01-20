import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native'
import { Plus, Pencil, Trash2 } from 'lucide-react-native'
import { useFamilyStore } from '../store'
import type { Child } from '../types/database'

export default function ChildSelector() {
  const { children, selectedChildId, selectChild, addChild, updateChild, deleteChild } =
    useFamilyStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const resetForm = () => {
    setName('')
    setAge('')
    setEditingChild(null)
  }

  const handleAdd = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    const ageNum = parseInt(age, 10)
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      Alert.alert('Error', 'Please enter a valid age (1-18)')
      return
    }

    const { error } = await addChild(name.trim(), ageNum)
    if (error) {
      Alert.alert('Error', error)
    } else {
      setShowAddModal(false)
      resetForm()
    }
  }

  const handleEdit = async () => {
    if (!editingChild || !name.trim() || !age.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    const ageNum = parseInt(age, 10)
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      Alert.alert('Error', 'Please enter a valid age (1-18)')
      return
    }

    const { error } = await updateChild(editingChild.id, name.trim(), ageNum)
    if (error) {
      Alert.alert('Error', error)
    } else {
      setShowEditModal(false)
      resetForm()
    }
  }

  const handleDelete = async () => {
    if (!editingChild) return

    const { error } = await deleteChild(editingChild.id)
    if (error) {
      Alert.alert('Error', error)
    } else {
      setShowDeleteConfirm(false)
      resetForm()
    }
  }

  const openEditModal = (child: Child) => {
    setEditingChild(child)
    setName(child.name)
    setAge(child.age.toString())
    setShowEditModal(true)
  }

  const openDeleteConfirm = (child: Child) => {
    setEditingChild(child)
    setShowDeleteConfirm(true)
  }

  return (
    <View>
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
              onLongPress={() => openEditModal(child)}
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
              <Text
                className={`text-sm font-semibold ${isSelected ? 'text-primary-800' : 'text-gray-700'}`}
              >
                {child.name}
              </Text>
              <Text className={`text-xs mt-0.5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                {child.age} years
              </Text>
            </TouchableOpacity>
          )
        })}

        {/* Add Child Button */}
        <TouchableOpacity
          className="items-center justify-center p-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 min-w-[90px]"
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <View className="w-14 h-14 rounded-full justify-center items-center mb-2 bg-gray-200">
            <Plus size={24} color="#6B7280" />
          </View>
          <Text className="text-sm font-semibold text-gray-500">Add</Text>
          <Text className="text-xs mt-0.5 text-gray-400">Child</Text>
        </TouchableOpacity>
      </ScrollView>

      {children.length > 0 && (
        <Text className="text-xs text-gray-400 mt-2 ml-1">Long press to edit</Text>
      )}

      {/* Add Child Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAddModal(false)
          resetForm()
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => {
            setShowAddModal(false)
            resetForm()
          }}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <Text className="text-xl font-bold text-gray-900 mb-4 text-center">Add Child</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Child's name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">Age</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Age (1-18)"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                onPress={handleAdd}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Child Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowEditModal(false)
          resetForm()
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => {
            setShowEditModal(false)
            resetForm()
          }}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <Text className="text-xl font-bold text-gray-900 mb-4 text-center">Edit Child</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Child's name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">Age</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Age (1-18)"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-2"
              onPress={() => {
                setShowEditModal(false)
                openDeleteConfirm(editingChild!)
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text className="text-red-500 font-medium ml-2">Delete Child</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteConfirm(false)
          resetForm()
        }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => {
            setShowDeleteConfirm(false)
            resetForm()
          }}
        >
          <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
                <Trash2 size={24} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Delete Child?</Text>
            </View>
            <Text className="text-gray-500 text-center mb-6">
              This will permanently delete {editingChild?.name} and all their session history.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                onPress={() => {
                  setShowDeleteConfirm(false)
                  resetForm()
                }}
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
