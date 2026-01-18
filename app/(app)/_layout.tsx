import { useEffect, useState } from 'react'
import { Redirect, Stack, router } from 'expo-router'
import { useAuthStore, useSessionStore } from '../../store'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native'

export default function AppLayout() {
  const { user, isLoading, isInitialized } = useAuthStore()
  const activeSession = useSessionStore((state) => state.activeSession)
  const abandonSession = useSessionStore((state) => state.abandonSession)

  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [hasCheckedSession, setHasCheckedSession] = useState(false)

  // Check for incomplete session on mount
  useEffect(() => {
    if (isInitialized && user && activeSession && !hasCheckedSession) {
      setShowRecoveryModal(true)
      setHasCheckedSession(true)
    }
  }, [isInitialized, user, activeSession, hasCheckedSession])

  const handleResume = () => {
    setShowRecoveryModal(false)
    if (activeSession) {
      router.push(`/(app)/routine/${activeSession.routineId}`)
    }
  }

  const handleAbandon = async () => {
    setShowRecoveryModal(false)
    await abandonSession()
  }

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    )
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="routine/[id]"
          options={{
            title: 'Routine',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="celebration"
          options={{
            title: 'Celebration',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="suggest"
          options={{
            title: 'Suggest Routine',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>

      {/* Session Recovery Modal */}
      <Modal
        visible={showRecoveryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRecoveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>⏱️</Text>
            <Text style={styles.modalTitle}>Incomplete Routine</Text>
            <Text style={styles.modalMessage}>
              You have an unfinished routine. Would you like to resume where you left off?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.abandonButton]}
                onPress={handleAbandon}
              >
                <Text style={styles.abandonButtonText}>Abandon</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.resumeButton]}
                onPress={handleResume}
              >
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  abandonButton: {
    backgroundColor: '#F3F4F6',
  },
  abandonButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#10B981',
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
