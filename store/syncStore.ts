import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { supabase } from '../lib/supabase'
import type { SessionUpdate } from '../types/database'

type OperationType = 'complete_session' | 'abandon_session'

interface PendingOperation {
  id: string
  type: OperationType
  sessionId: string
  payload: SessionUpdate
  timestamp: number
  retryCount: number
}

interface SyncState {
  pendingOperations: PendingOperation[]
  isOnline: boolean
  isSyncing: boolean

  // Actions
  addOperation: (type: OperationType, sessionId: string, payload: SessionUpdate) => void
  flushQueue: () => Promise<void>
  setOnline: (isOnline: boolean) => void
  initializeNetworkListener: () => () => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      pendingOperations: [],
      isOnline: true,
      isSyncing: false,

      addOperation: (type, sessionId, payload) => {
        const operation: PendingOperation = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          sessionId,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
        }

        set((state) => ({
          pendingOperations: [...state.pendingOperations, operation],
        }))
      },

      flushQueue: async () => {
        const { pendingOperations, isOnline, isSyncing } = get()

        if (!isOnline || isSyncing || pendingOperations.length === 0) {
          return
        }

        set({ isSyncing: true })

        const failedOperations: PendingOperation[] = []

        for (const op of pendingOperations) {
          try {
            const { error } = await supabase
              .from('sessions')
              .update(op.payload)
              .eq('id', op.sessionId)

            if (error) {
              // If error, keep in queue with incremented retry count
              if (op.retryCount < 3) {
                failedOperations.push({
                  ...op,
                  retryCount: op.retryCount + 1,
                })
              } else {
                console.error(`Operation failed after 3 retries:`, op, error)
              }
            }
          } catch (error) {
            // Network error, keep in queue
            failedOperations.push({
              ...op,
              retryCount: op.retryCount + 1,
            })
          }
        }

        set({
          pendingOperations: failedOperations,
          isSyncing: false,
        })
      },

      setOnline: (isOnline) => {
        set({ isOnline })

        // Auto-flush when coming online
        if (isOnline) {
          get().flushQueue()
        }
      },

      initializeNetworkListener: () => {
        const unsubscribe = NetInfo.addEventListener((state) => {
          get().setOnline(state.isConnected ?? false)
        })

        // Get initial state
        NetInfo.fetch().then((state) => {
          get().setOnline(state.isConnected ?? false)
        })

        return unsubscribe
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pendingOperations: state.pendingOperations,
      }),
    }
  )
)
