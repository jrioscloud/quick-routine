import { useState, useEffect } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Sparkles, Save, RefreshCw, Star, Pencil } from 'lucide-react-native'
import { TaskIcon } from '../../lib/icons'
import { suggestRoutine, SuggestedRoutine } from '../../lib/claude'
import { useFamilyStore } from '../../store/familyStore'

export default function SuggestScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>()
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestedRoutine | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const routines = useFamilyStore((state) => state.routines)
  const addRoutine = useFamilyStore((state) => state.addRoutine)
  const updateRoutine = useFamilyStore((state) => state.updateRoutine)

  // Load routine for editing
  useEffect(() => {
    if (editId) {
      const routine = routines.find((r) => r.id === editId)
      if (routine) {
        setIsEditMode(true)
        setSuggestion({
          routineName: routine.name,
          routineType: routine.routine_type as 'morning' | 'evening' | 'homework' | 'custom',
          explanation: 'Editing existing routine',
          tasks: routine.tasks.map((t) => ({
            name: t.name,
            icon: t.icon,
            points: t.points,
          })),
        })
      }
    }
  }, [editId, routines])

  const handleSuggest = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the routine you need')
      return
    }

    setIsLoading(true)
    setSuggestion(null)

    const { routine, error } = await suggestRoutine(description)

    setIsLoading(false)

    if (error) {
      Alert.alert('Error', error)
      return
    }

    setSuggestion(routine)
  }

  const handleSave = async () => {
    if (!suggestion) return

    setIsSaving(true)

    const tasks = suggestion.tasks.map((task, index) => ({
      name: task.name,
      icon: task.icon,
      points: task.points,
      sort_order: index,
    }))

    let error: string | null

    if (isEditMode && editId) {
      const result = await updateRoutine(editId, suggestion.routineName, suggestion.routineType, tasks)
      error = result.error
    } else {
      const result = await addRoutine(suggestion.routineName, suggestion.routineType, tasks)
      error = result.error
    }

    setIsSaving(false)

    if (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'save'} routine. Please try again.`)
      return
    }

    Alert.alert('Success', `Routine ${isEditMode ? 'updated' : 'saved'}!`, [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  const handleReset = () => {
    setSuggestion(null)
    setDescription('')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Input Section */}
          {!suggestion && (
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Sparkles size={28} color="#10B981" />
                <Text className="text-3xl font-bold text-gray-900 ml-2">AI Routine</Text>
              </View>
              <Text className="text-base text-gray-500 mb-6 leading-6">
                Describe your child and what kind of routine they need. Be specific about their age and any challenges.
              </Text>

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-900 min-h-[140px] mb-6"
                placeholder="Example: My 6-year-old daughter needs a morning routine. She struggles with getting dressed and often forgets to brush her teeth."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isLoading}
              />

              <TouchableOpacity
                className={`flex-row items-center justify-center bg-primary-500 rounded-xl py-4 ${isLoading ? 'opacity-70' : ''}`}
                onPress={handleSuggest}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="#fff" size="small" />
                    <Text className="text-white text-lg font-semibold">Creating routine...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Sparkles size={20} color="#fff" />
                    <Text className="text-white text-lg font-semibold">Get AI Suggestion</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Preview Section */}
          {suggestion && (
            <View className="flex-1">
              {isEditMode && (
                <View className="flex-row items-center mb-4">
                  <Pencil size={24} color="#10B981" />
                  <Text className="text-2xl font-bold text-gray-900 ml-2">Edit Routine</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between mb-3">
                <TextInput
                  className="text-2xl font-bold text-gray-900 flex-1 py-2"
                  value={suggestion.routineName}
                  onChangeText={(text) => setSuggestion({ ...suggestion, routineName: text })}
                  placeholder="Routine name"
                />
                <View className="bg-primary-50 px-3 py-1.5 rounded-full">
                  <Text className="text-primary-600 text-sm font-medium capitalize">{suggestion.routineType}</Text>
                </View>
              </View>

              {!isEditMode && (
                <Text className="text-base text-gray-500 mb-6 leading-6">{suggestion.explanation}</Text>
              )}

              <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tasks</Text>
                {suggestion.tasks.map((task, index) => (
                  <View key={index} className="flex-row items-center py-3 border-b border-gray-200 last:border-b-0">
                    <View className="w-10 h-10 rounded-lg bg-white items-center justify-center mr-3">
                      <TaskIcon taskName={task.name} size={22} color="#6B7280" />
                    </View>
                    <View className="flex-1 flex-row justify-between items-center">
                      <Text className="text-base text-gray-900 flex-1">{task.name}</Text>
                      <View className="flex-row items-center">
                        <Star size={14} color="#D97706" />
                        <Text className="text-sm text-amber-600 font-medium ml-1">+{task.points}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-between items-center bg-primary-50 rounded-xl p-4 mb-6">
                <Text className="text-base font-semibold text-primary-800">Total Points:</Text>
                <View className="flex-row items-center">
                  <Star size={18} color="#D97706" />
                  <Text className="text-xl font-bold text-primary-600 ml-1">
                    {suggestion.tasks.reduce((sum, t) => sum + t.points, 0)}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-gray-100 rounded-xl py-4"
                  onPress={handleReset}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={18} color="#6B7280" />
                  <Text className="text-gray-500 text-base font-semibold ml-2">Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center bg-primary-500 rounded-xl py-4 ${isSaving ? 'opacity-70' : ''}`}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Save size={18} color="#fff" />
                      <Text className="text-white text-base font-semibold ml-2">
                        {isEditMode ? 'Update Routine' : 'Save Routine'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
