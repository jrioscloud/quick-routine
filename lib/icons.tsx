import React from 'react'
import {
  Sun,
  Moon,
  Sparkles,
  Utensils,
  Shirt,
  Bath,
  BookOpen,
  Brush,
  Bed,
  Clock,
  CheckCircle,
  Star,
  Heart,
  Music,
  Gamepad2,
  Pencil,
  Calculator,
  Backpack,
  Apple,
  Coffee,
  Glasses,
  Footprints,
  Smile,
  Hand,
  Droplets,
  Wind,
  Zap,
  Target,
  Award,
  type LucideIcon,
} from 'lucide-react-native'

// Map of keywords to icons
const iconKeywords: Record<string, LucideIcon> = {
  // Morning
  wake: Sun,
  morning: Sun,
  sunrise: Sun,

  // Evening/Night
  sleep: Moon,
  bed: Bed,
  night: Moon,
  evening: Moon,

  // Hygiene
  brush: Brush,
  teeth: Brush,
  tooth: Brush,
  bath: Bath,
  shower: Bath,
  wash: Droplets,
  clean: Sparkles,

  // Clothing
  dress: Shirt,
  clothes: Shirt,
  outfit: Shirt,
  wear: Shirt,

  // Food
  breakfast: Utensils,
  lunch: Utensils,
  dinner: Utensils,
  eat: Utensils,
  food: Utensils,
  snack: Apple,
  drink: Coffee,

  // School/Learning
  homework: Pencil,
  study: BookOpen,
  read: BookOpen,
  book: BookOpen,
  math: Calculator,
  school: Backpack,
  learn: Glasses,

  // Activities
  play: Gamepad2,
  game: Gamepad2,
  music: Music,
  exercise: Footprints,
  walk: Footprints,

  // Emotions/Goals
  happy: Smile,
  smile: Smile,
  kind: Heart,
  love: Heart,
  goal: Target,
  focus: Target,
  energy: Zap,
  fast: Zap,

  // Completion
  done: CheckCircle,
  finish: CheckCircle,
  complete: CheckCircle,
  check: CheckCircle,

  // Rewards
  star: Star,
  reward: Award,
  prize: Award,

  // Misc
  hand: Hand,
  wave: Hand,
  air: Wind,
}

// Default icon if no match found
const DefaultIcon = CheckCircle

/**
 * Get a Lucide icon component based on task name
 */
export function getTaskIcon(taskName: string): LucideIcon {
  const lowerName = taskName.toLowerCase()

  // Check each keyword
  for (const [keyword, Icon] of Object.entries(iconKeywords)) {
    if (lowerName.includes(keyword)) {
      return Icon
    }
  }

  return DefaultIcon
}

interface TaskIconProps {
  taskName: string
  size?: number
  color?: string
}

/**
 * Render a task icon based on task name
 */
export function TaskIcon({ taskName, size = 24, color = '#10B981' }: TaskIconProps) {
  const Icon = getTaskIcon(taskName)
  return <Icon size={size} color={color} />
}
