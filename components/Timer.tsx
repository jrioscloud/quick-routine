import { useEffect, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Pause, Play, RotateCcw } from 'lucide-react-native'
import { useSessionStore, TIMER_DURATION_SECONDS } from '../store/sessionStore'

interface TimerProps {
  onComplete?: () => void
}

export default function Timer({ onComplete }: TimerProps) {
  const getRemainingSeconds = useSessionStore((state) => state.getRemainingSeconds)
  const isTimerComplete = useSessionStore((state) => state.isTimerComplete)
  const isPaused = useSessionStore((state) => state.isPaused)
  const pauseTimer = useSessionStore((state) => state.pauseTimer)
  const resumeTimer = useSessionStore((state) => state.resumeTimer)
  const restartTimer = useSessionStore((state) => state.restartTimer)
  const [displaySeconds, setDisplaySeconds] = useState(getRemainingSeconds())

  // Track if onComplete has already fired to prevent multiple calls
  const hasCompletedRef = useRef(false)

  // Reset completion flag when timer restarts
  useEffect(() => {
    const remaining = getRemainingSeconds()
    if (remaining > 0) {
      hasCompletedRef.current = false
    }
  }, [getRemainingSeconds])

  useEffect(() => {
    // Update display every second
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds()
      setDisplaySeconds(remaining)

      // Only fire onComplete once when timer hits 0
      if (remaining === 0 && onComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [getRemainingSeconds, onComplete])

  // Format time as MM:SS
  const minutes = Math.floor(displaySeconds / 60)
  const seconds = displaySeconds % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Calculate progress for visual indicator
  const progress = 1 - displaySeconds / TIMER_DURATION_SECONDS
  const isLowTime = displaySeconds <= 60 // Last minute

  const handleTogglePause = () => {
    if (isPaused) {
      resumeTimer()
    } else {
      pauseTimer()
    }
  }

  return (
    <View className="items-center justify-center">
      <View className="w-44 h-44 rounded-full bg-gray-100 items-center justify-center overflow-hidden border-4 border-gray-200">
        <View
          style={[
            styles.progressFill,
            {
              height: `${progress * 100}%`,
              backgroundColor: isLowTime ? '#EF4444' : '#10B981',
            },
          ]}
        />
        <View className="items-center">
          <Text
            className={`text-5xl font-bold ${isLowTime ? 'text-red-500' : 'text-gray-900'}`}
            style={styles.tabularNums}
          >
            {timeDisplay}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {isTimerComplete() ? 'Time is up' : isPaused ? 'Paused' : 'remaining'}
          </Text>
        </View>
      </View>

      {/* Timer Controls */}
      <View className="flex-row items-center gap-3 mt-4">
        {/* Pause/Resume Button */}
        <TouchableOpacity
          onPress={handleTogglePause}
          className={`flex-row items-center px-5 py-3 rounded-full ${
            isPaused ? 'bg-primary-500' : 'bg-gray-200'
          }`}
          activeOpacity={0.7}
        >
          {isPaused ? (
            <>
              <Play size={18} color="#fff" fill="#fff" />
              <Text className="text-white font-semibold ml-2">Resume</Text>
            </>
          ) : (
            <>
              <Pause size={18} color="#374151" />
              <Text className="text-gray-700 font-semibold ml-2">Pause</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Restart Button */}
        <TouchableOpacity
          onPress={restartTimer}
          className="flex-row items-center px-5 py-3 rounded-full bg-gray-200"
          activeOpacity={0.7}
        >
          <RotateCcw size={18} color="#374151" />
          <Text className="text-gray-700 font-semibold ml-2">Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Keep minimal styles for things that can't be done with Tailwind
const styles = StyleSheet.create({
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.2,
  },
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
})
