import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type { Child, RoutineWithTasks } from '../types/database'

interface NewTaskInput {
  name: string
  icon: string
  points: number
  sort_order: number
}

interface FamilyState {
  children: Child[]
  selectedChildId: string | null
  routines: RoutineWithTasks[]
  isLoading: boolean

  // Actions
  fetchChildren: (familyId: string) => Promise<void>
  fetchRoutines: (familyId: string) => Promise<void>
  selectChild: (childId: string) => void
  addChild: (name: string, age: number) => Promise<{ error: string | null }>
  updateChild: (childId: string, name: string, age: number) => Promise<{ error: string | null }>
  deleteChild: (childId: string) => Promise<{ error: string | null }>
  addRoutine: (
    name: string,
    routineType: string,
    tasks: NewTaskInput[]
  ) => Promise<{ error: string | null }>
  updateRoutine: (
    routineId: string,
    name: string,
    routineType: string,
    tasks: NewTaskInput[]
  ) => Promise<{ error: string | null }>
  deleteRoutine: (routineId: string) => Promise<{ error: string | null }>
  reset: () => void
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,
      routines: [],
      isLoading: false,

      fetchChildren: async (familyId) => {
        try {
          set({ isLoading: true })

          const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('family_id', familyId)
            .order('created_at', { ascending: true })

          if (error) throw error

          set({ children: data || [] })

          // Auto-select first child if none selected
          if (data && data.length > 0 && !get().selectedChildId) {
            set({ selectedChildId: data[0].id })
          }
        } catch (error) {
          console.error('Error fetching children:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchRoutines: async (familyId) => {
        try {
          set({ isLoading: true })

          // Fetch routines with their tasks
          const { data: routines, error: routinesError } = await supabase
            .from('routines')
            .select('*')
            .eq('family_id', familyId)
            .order('created_at', { ascending: true })

          if (routinesError) throw routinesError

          if (!routines || routines.length === 0) {
            set({ routines: [] })
            return
          }

          // Fetch tasks for all routines
          const routineIds = routines.map((r) => r.id)
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('routine_id', routineIds)
            .order('sort_order', { ascending: true })

          if (tasksError) throw tasksError

          // Combine routines with their tasks
          const routinesWithTasks: RoutineWithTasks[] = routines.map((routine) => ({
            ...routine,
            tasks: (tasks || []).filter((task) => task.routine_id === routine.id),
          }))

          set({ routines: routinesWithTasks })
        } catch (error) {
          console.error('Error fetching routines:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      selectChild: (childId) => set({ selectedChildId: childId }),

      addChild: async (name, age) => {
        const family = useAuthStore.getState().family
        if (!family) {
          return { error: 'No family found' }
        }

        set({ isLoading: true })

        try {
          const { data: child, error } = await supabase
            .from('children')
            .insert({
              family_id: family.id,
              name,
              age,
            })
            .select()
            .single()

          if (error) {
            return { error: error.message }
          }

          set((state) => ({
            children: [...state.children, child],
            selectedChildId: state.selectedChildId || child.id,
          }))

          return { error: null }
        } catch (error) {
          return { error: 'Failed to add child' }
        } finally {
          set({ isLoading: false })
        }
      },

      updateChild: async (childId, name, age) => {
        set({ isLoading: true })

        try {
          const { error } = await supabase
            .from('children')
            .update({ name, age })
            .eq('id', childId)

          if (error) {
            return { error: error.message }
          }

          set((state) => ({
            children: state.children.map((c) =>
              c.id === childId ? { ...c, name, age } : c
            ),
          }))

          return { error: null }
        } catch (error) {
          return { error: 'Failed to update child' }
        } finally {
          set({ isLoading: false })
        }
      },

      deleteChild: async (childId) => {
        set({ isLoading: true })

        try {
          // First delete any sessions for this child
          await supabase.from('sessions').delete().eq('child_id', childId)

          // Then delete the child
          const { error } = await supabase
            .from('children')
            .delete()
            .eq('id', childId)

          if (error) {
            return { error: error.message }
          }

          set((state) => {
            const newChildren = state.children.filter((c) => c.id !== childId)
            return {
              children: newChildren,
              selectedChildId:
                state.selectedChildId === childId
                  ? newChildren[0]?.id || null
                  : state.selectedChildId,
            }
          })

          return { error: null }
        } catch (error) {
          return { error: 'Failed to delete child' }
        } finally {
          set({ isLoading: false })
        }
      },

      addRoutine: async (name, routineType, tasks) => {
        const family = useAuthStore.getState().family
        if (!family) {
          return { error: 'No family found' }
        }

        set({ isLoading: true })

        try {
          // Create the routine first
          const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
              family_id: family.id,
              name,
              routine_type: routineType,
            })
            .select()
            .single()

          if (routineError) {
            return { error: routineError.message }
          }

          // Create tasks for the routine
          const tasksToInsert = tasks.map((task) => ({
            routine_id: routine.id,
            name: task.name,
            icon: task.icon,
            points: task.points,
            sort_order: task.sort_order,
          }))

          const { data: insertedTasks, error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)
            .select()

          if (tasksError) {
            // Try to clean up the routine if tasks failed
            await supabase.from('routines').delete().eq('id', routine.id)
            return { error: tasksError.message }
          }

          // Add to local state
          const routineWithTasks: RoutineWithTasks = {
            ...routine,
            tasks: insertedTasks || [],
          }

          set((state) => ({
            routines: [...state.routines, routineWithTasks],
          }))

          return { error: null }
        } catch (error) {
          return { error: 'Failed to create routine' }
        } finally {
          set({ isLoading: false })
        }
      },

      updateRoutine: async (routineId, name, routineType, tasks) => {
        set({ isLoading: true })

        try {
          // Update routine
          const { error: routineError } = await supabase
            .from('routines')
            .update({ name, routine_type: routineType })
            .eq('id', routineId)

          if (routineError) {
            return { error: routineError.message }
          }

          // Delete existing tasks
          const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .eq('routine_id', routineId)

          if (deleteError) {
            return { error: deleteError.message }
          }

          // Insert new tasks
          const tasksToInsert = tasks.map((task) => ({
            routine_id: routineId,
            name: task.name,
            icon: task.icon,
            points: task.points,
            sort_order: task.sort_order,
          }))

          const { data: insertedTasks, error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)
            .select()

          if (tasksError) {
            return { error: tasksError.message }
          }

          // Update local state
          set((state) => ({
            routines: state.routines.map((r) =>
              r.id === routineId
                ? { ...r, name, routine_type: routineType, tasks: insertedTasks || [] }
                : r
            ),
          }))

          return { error: null }
        } catch (error) {
          return { error: 'Failed to update routine' }
        } finally {
          set({ isLoading: false })
        }
      },

      deleteRoutine: async (routineId) => {
        set({ isLoading: true })

        try {
          // Delete tasks first (due to foreign key)
          const { error: tasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('routine_id', routineId)

          if (tasksError) {
            return { error: tasksError.message }
          }

          // Delete routine
          const { error: routineError } = await supabase
            .from('routines')
            .delete()
            .eq('id', routineId)

          if (routineError) {
            return { error: routineError.message }
          }

          // Update local state
          set((state) => ({
            routines: state.routines.filter((r) => r.id !== routineId),
          }))

          return { error: null }
        } catch (error) {
          return { error: 'Failed to delete routine' }
        } finally {
          set({ isLoading: false })
        }
      },

      reset: () =>
        set({
          children: [],
          selectedChildId: null,
          routines: [],
          isLoading: false,
        }),
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        children: state.children,
        selectedChildId: state.selectedChildId,
        routines: state.routines,
      }),
    }
  )
)
