import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { useSyncStore } from './syncStore'
import type { Session, Task, SessionInsert, SessionUpdate } from '../types/database'

// Timer duration in seconds (5 minutes for testing)
export const TIMER_DURATION_SECONDS = 300

interface ActiveSession {
  id: string
  routineId: string
  childId: string
  startedAt: number // Unix timestamp (ms)
  pausedAt: number | null // Unix timestamp when paused (ms)
  totalPausedTime: number // Total ms spent paused
  tasks: Task[]
  completedTaskIds: string[]
}

interface CompletionResult {
  error: string | null
  session: Session | null
  queuedOffline: boolean
}

interface SessionState {
  activeSession: ActiveSession | null
  isLoading: boolean
  isPaused: boolean

  // Timer calculations (derived from startedAt, accounting for pauses)
  getElapsedSeconds: () => number
  getRemainingSeconds: () => number
  isTimerComplete: () => boolean

  // Timer controls
  pauseTimer: () => void
  resumeTimer: () => void
  restartTimer: () => void

  // Actions
  startSession: (routineId: string, childId: string, tasks: Task[]) => Promise<{ error: string | null }>
  toggleTask: (taskId: string) => void
  completeSession: () => Promise<CompletionResult>
  abandonSession: () => Promise<{ error: string | null; queuedOffline: boolean }>
  checkForIncompleteSession: () => boolean
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      isLoading: false,
      isPaused: false,

      // Timer calculations using timestamp math (ADR-003)
      // Now accounts for paused time
      getElapsedSeconds: () => {
        const { activeSession, isPaused } = get()
        if (!activeSession) return 0

        const now = isPaused && activeSession.pausedAt
          ? activeSession.pausedAt
          : Date.now()

        const totalElapsed = now - activeSession.startedAt - activeSession.totalPausedTime
        return Math.floor(totalElapsed / 1000)
      },

      getRemainingSeconds: () => {
        const elapsed = get().getElapsedSeconds()
        return Math.max(0, TIMER_DURATION_SECONDS - elapsed)
      },

      isTimerComplete: () => {
        return get().getRemainingSeconds() === 0
      },

      pauseTimer: () => {
        const { activeSession, isPaused } = get()
        if (!activeSession || isPaused) return

        set({
          isPaused: true,
          activeSession: {
            ...activeSession,
            pausedAt: Date.now(),
          },
        })
      },

      resumeTimer: () => {
        const { activeSession, isPaused } = get()
        if (!activeSession || !isPaused || !activeSession.pausedAt) return

        const pauseDuration = Date.now() - activeSession.pausedAt

        set({
          isPaused: false,
          activeSession: {
            ...activeSession,
            pausedAt: null,
            totalPausedTime: activeSession.totalPausedTime + pauseDuration,
          },
        })
      },

      restartTimer: () => {
        const { activeSession } = get()
        if (!activeSession) return

        set({
          isPaused: false,
          activeSession: {
            ...activeSession,
            startedAt: Date.now(),
            pausedAt: null,
            totalPausedTime: 0,
          },
        })
      },

      startSession: async (routineId, childId, tasks) => {
        set({ isLoading: true })

        try {
          const startedAt = Date.now()

          // Create session in Supabase
          const { data, error } = await supabase
            .from('sessions')
            .insert({
              routine_id: routineId,
              child_id: childId,
              started_at: new Date(startedAt).toISOString(),
              status: 'in_progress',
            } as SessionInsert)
            .select()
            .single()

          if (error) {
            return { error: error.message }
          }

          set({
            activeSession: {
              id: data.id,
              routineId,
              childId,
              startedAt,
              pausedAt: null,
              totalPausedTime: 0,
              tasks,
              completedTaskIds: [],
            },
            isPaused: false,
          })

          return { error: null }
        } catch (error) {
          return { error: 'Failed to start session' }
        } finally {
          set({ isLoading: false })
        }
      },

      toggleTask: (taskId) => {
        set((state) => {
          if (!state.activeSession) return state

          const { completedTaskIds } = state.activeSession
          const isCompleted = completedTaskIds.includes(taskId)

          return {
            activeSession: {
              ...state.activeSession,
              completedTaskIds: isCompleted
                ? completedTaskIds.filter((id) => id !== taskId)
                : [...completedTaskIds, taskId],
            },
          }
        })
      },

      completeSession: async () => {
        const { activeSession } = get()
        if (!activeSession) {
          return { error: 'No active session', session: null, queuedOffline: false }
        }

        set({ isLoading: true })

        const completedAt = Date.now()
        const durationSeconds = Math.floor(
          (completedAt - activeSession.startedAt - activeSession.totalPausedTime) / 1000
        )

        // Calculate points earned
        const pointsEarned = activeSession.tasks
          .filter((task) => activeSession.completedTaskIds.includes(task.id))
          .reduce((sum, task) => sum + task.points, 0)

        const updateData: SessionUpdate = {
          completed_at: new Date(completedAt).toISOString(),
          duration_seconds: durationSeconds,
          points_earned: pointsEarned,
          status: 'completed',
        }

        try {
          const { data, error } = await supabase
            .from('sessions')
            .update(updateData)
            .eq('id', activeSession.id)
            .select()
            .single()

          if (error) {
            // Queue for offline sync
            useSyncStore.getState().addOperation('complete_session', activeSession.id, updateData)

            // Still clear the session locally - we'll sync later
            const localSession: Session = {
              id: activeSession.id,
              child_id: activeSession.childId,
              routine_id: activeSession.routineId,
              started_at: new Date(activeSession.startedAt).toISOString(),
              completed_at: updateData.completed_at!,
              duration_seconds: durationSeconds,
              points_earned: pointsEarned,
              status: 'completed',
              created_at: new Date(activeSession.startedAt).toISOString(),
            }

            set({ activeSession: null, isPaused: false })
            return { error: null, session: localSession, queuedOffline: true }
          }

          set({ activeSession: null, isPaused: false })
          return { error: null, session: data, queuedOffline: false }
        } catch (error) {
          // Network error - queue for offline sync
          useSyncStore.getState().addOperation('complete_session', activeSession.id, updateData)

          const localSession: Session = {
            id: activeSession.id,
            child_id: activeSession.childId,
            routine_id: activeSession.routineId,
            started_at: new Date(activeSession.startedAt).toISOString(),
            completed_at: updateData.completed_at!,
            duration_seconds: durationSeconds,
            points_earned: pointsEarned,
            status: 'completed',
            created_at: new Date(activeSession.startedAt).toISOString(),
          }

          set({ activeSession: null, isPaused: false })
          return { error: null, session: localSession, queuedOffline: true }
        } finally {
          set({ isLoading: false })
        }
      },

      abandonSession: async () => {
        const { activeSession } = get()
        if (!activeSession) {
          return { error: 'No active session', queuedOffline: false }
        }

        set({ isLoading: true })

        const updateData: SessionUpdate = { status: 'abandoned' }

        try {
          const { error } = await supabase
            .from('sessions')
            .update(updateData)
            .eq('id', activeSession.id)

          if (error) {
            // Queue for offline sync
            useSyncStore.getState().addOperation('abandon_session', activeSession.id, updateData)
            set({ activeSession: null, isPaused: false })
            return { error: null, queuedOffline: true }
          }

          set({ activeSession: null, isPaused: false })
          return { error: null, queuedOffline: false }
        } catch (error) {
          // Network error - queue for offline sync
          useSyncStore.getState().addOperation('abandon_session', activeSession.id, updateData)
          set({ activeSession: null, isPaused: false })
          return { error: null, queuedOffline: true }
        } finally {
          set({ isLoading: false })
        }
      },

      checkForIncompleteSession: () => {
        const { activeSession } = get()
        return activeSession !== null
      },

      clearSession: () => set({ activeSession: null, isPaused: false }),
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeSession: state.activeSession,
        isPaused: state.isPaused,
      }),
    }
  )
)
