import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import type { Family } from '../types/database'

interface AuthState {
  user: { id: string; email: string } | null
  family: Family | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string, familyName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  setFamily: (family: Family | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      family: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true })

          const { data: { session } } = await supabase.auth.getSession()

          if (session?.user) {
            set({ user: { id: session.user.id, email: session.user.email! } })

            // Fetch family data - use maybeSingle() since new users may not have a family yet
            const { data: family } = await supabase
              .from('families')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle()

            if (family) {
              set({ family })
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },

      signUp: async (email, password, familyName) => {
        set({ isLoading: true })

        try {
          // Sign up with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          })

          if (authError) {
            return { error: authError.message }
          }

          if (!authData.user) {
            return { error: 'Failed to create user' }
          }

          // Create family record
          const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({
              user_id: authData.user.id,
              name: familyName,
              email: email,
            })
            .select()
            .single()

          if (familyError) {
            return { error: familyError.message }
          }

          // Create default child for testing
          const { data: child, error: childError } = await supabase
            .from('children')
            .insert({
              family_id: family.id,
              name: 'My Child',
              age: 6,
            })
            .select()
            .single()

          if (childError) {
            console.error('Failed to create default child:', childError)
          }

          // Create a starter routine with 5 tasks
          const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
              family_id: family.id,
              name: 'Morning Routine',
              routine_type: 'morning',
            })
            .select()
            .single()

          if (!routineError && routine) {
            // Add 5 tasks to the routine
            const tasks = [
              { routine_id: routine.id, name: 'Wake up & stretch', icon: '🌅', points: 5, sort_order: 0 },
              { routine_id: routine.id, name: 'Brush teeth', icon: '🦷', points: 10, sort_order: 1 },
              { routine_id: routine.id, name: 'Get dressed', icon: '👕', points: 10, sort_order: 2 },
              { routine_id: routine.id, name: 'Eat breakfast', icon: '🥣', points: 15, sort_order: 3 },
              { routine_id: routine.id, name: 'Pack school bag', icon: '🎒', points: 10, sort_order: 4 },
            ]

            const { error: tasksError } = await supabase.from('tasks').insert(tasks)
            if (tasksError) {
              console.error('Failed to create default tasks:', tasksError)
            }
          }

          set({
            user: { id: authData.user.id, email: authData.user.email! },
            family,
          })

          return { error: null }
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true })

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (!data.user) {
            return { error: 'Failed to sign in' }
          }

          // Fetch family data - use maybeSingle() since family may not exist yet
          const { data: family } = await supabase
            .from('families')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle()

          set({
            user: { id: data.user.id, email: data.user.email! },
            family,
          })

          return { error: null }
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, family: null })
      },

      setFamily: (family) => set({ family }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        family: state.family,
      }),
    }
  )
)
