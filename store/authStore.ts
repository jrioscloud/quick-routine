import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import type { Family } from '../types/database'
import { useSessionStore } from './sessionStore'
import { useSyncStore } from './syncStore'

interface AuthState {
  user: { id: string; email: string } | null
  family: Family | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  setupAuthListener: () => () => void
  signUp: (email: string, password: string, familyName: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
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

            // Fetch family data
            let { data: family } = await supabase
              .from('families')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle()

            // If no family exists, create one using metadata from signup
            // This handles edge cases where app restarts after email confirmation
            if (!family) {
              const familyName = session.user.user_metadata?.family_name || 'My Family'
              console.log('[Auth] Initialize: No family found, creating with name:', familyName)

              const { data: newFamily, error: createError } = await supabase
                .from('families')
                .insert({
                  user_id: session.user.id,
                  name: familyName,
                  email: session.user.email!,
                })
                .select()
                .single()

              if (createError) {
                console.error('[Auth] Initialize: Failed to create family:', createError)
              } else {
                family = newFamily
                console.log('[Auth] Initialize: Family created:', family?.id)
              }
            }

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

      setupAuthListener: () => {
        // Listen for auth state changes (email confirmation, token refresh, sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[Auth] State change:', event, session?.user?.email)

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // User signed in or session refreshed - fetch/create family if not already loaded
              if (session?.user) {
                const currentFamily = get().family
                const currentUser = get().user

                // Update user state
                set({ user: { id: session.user.id, email: session.user.email! } })

                // Fetch family if not loaded or user changed
                if (!currentFamily || currentUser?.id !== session.user.id) {
                  let { data: family } = await supabase
                    .from('families')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .maybeSingle()

                  // If no family exists, create one using metadata from signup
                  // This handles the email confirmation flow where family wasn't created during signup
                  if (!family) {
                    const familyName = session.user.user_metadata?.family_name || 'My Family'
                    console.log('[Auth] No family found, creating with name:', familyName)

                    const { data: newFamily, error: createError } = await supabase
                      .from('families')
                      .insert({
                        user_id: session.user.id,
                        name: familyName,
                        email: session.user.email!,
                      })
                      .select()
                      .single()

                    if (createError) {
                      console.error('[Auth] Failed to create family:', createError)
                    } else {
                      family = newFamily
                      console.log('[Auth] Family created:', family?.id)
                    }
                  }

                  if (family) {
                    set({ family })
                  }
                }
              }
            } else if (event === 'SIGNED_OUT') {
              // Clear state on sign out
              set({ user: null, family: null })
            }
          }
        )

        // Return unsubscribe function
        return () => {
          subscription.unsubscribe()
        }
      },

      signUp: async (email, password, familyName) => {
        set({ isLoading: true })

        try {
          // Sign up with Supabase Auth
          // Store familyName in metadata - it will be used to create family after email confirmation
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                family_name: familyName,
              },
            },
          })

          if (authError) {
            return { error: authError.message, needsEmailConfirmation: false }
          }

          if (!authData.user) {
            return { error: 'Failed to create user', needsEmailConfirmation: false }
          }

          // Check if email confirmation is required
          // Supabase returns a session even during signup, but email_confirmed_at will be null
          // if email confirmation is enabled in the Supabase project settings
          const needsEmailConfirmation = !authData.user.email_confirmed_at

          if (needsEmailConfirmation) {
            // Don't set user state or create family - wait for email confirmation
            // The auth listener will handle family creation when user confirms email and signs in
            console.log('[Auth] Signup complete - email confirmation required')
            return { error: null, needsEmailConfirmation: true }
          }

          // Email confirmation is disabled - proceed to create family immediately
          console.log('[Auth] Signup complete - no email confirmation required')

          // Set user in state
          set({
            user: { id: authData.user.id, email: authData.user.email! },
          })

          // Create family immediately since email confirmation is disabled
          const { data: family, error: createError } = await supabase
            .from('families')
            .insert({
              user_id: authData.user.id,
              name: familyName,
              email: authData.user.email!,
            })
            .select()
            .single()

          if (createError) {
            console.error('[Auth] Failed to create family:', createError)
          } else if (family) {
            set({ family })
          }

          return { error: null, needsEmailConfirmation: false }
        } catch (error) {
          return { error: 'An unexpected error occurred', needsEmailConfirmation: false }
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

          // Fetch family data
          let { data: family } = await supabase
            .from('families')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle()

          // Create family if it doesn't exist (edge case recovery)
          if (!family) {
            const familyName = data.user.user_metadata?.family_name || 'My Family'
            console.log('[Auth] Sign in: No family found, creating with name:', familyName)

            const { data: newFamily, error: createError } = await supabase
              .from('families')
              .insert({
                user_id: data.user.id,
                name: familyName,
                email: data.user.email!,
              })
              .select()
              .single()

            if (createError) {
              console.error('[Auth] Sign in: Failed to create family:', createError)
            } else {
              family = newFamily
            }
          }

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
        // Sign out from Supabase
        await supabase.auth.signOut()

        // Clear all persisted store data from AsyncStorage
        // This prevents stale data from persisting across sign-outs
        await AsyncStorage.multiRemove([
          'auth-storage',
          'session-storage',
          'sync-storage',
        ])

        // Reset in-memory state for all stores
        // This ensures the current session sees cleared state immediately
        useSessionStore.getState().clearSession()
        useSyncStore.setState({ pendingOperations: [], isOnline: true, isSyncing: false })
        set({ user: null, family: null, isInitialized: false })
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
