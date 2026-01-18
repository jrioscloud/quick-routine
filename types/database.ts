// Database types for Quick Routine
// Matches the Supabase schema exactly

export interface Family {
  id: string
  user_id: string
  name: string
  email: string
  created_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  age: number
  created_at: string
}

export interface Routine {
  id: string
  family_id: string
  name: string
  routine_type: 'morning' | 'evening' | 'homework' | 'custom'
  created_at: string
}

export interface Task {
  id: string
  routine_id: string
  name: string
  icon: string
  points: number
  sort_order: number
  created_at: string
}

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export interface Session {
  id: string
  child_id: string
  routine_id: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  points_earned: number | null
  status: SessionStatus
  created_at: string
}

// Insert types (without generated fields)
export interface FamilyInsert {
  user_id: string
  name: string
  email: string
}

export interface ChildInsert {
  family_id: string
  name: string
  age: number
}

export interface RoutineInsert {
  family_id: string
  name: string
  routine_type: 'morning' | 'evening' | 'homework' | 'custom'
}

export interface TaskInsert {
  routine_id: string
  name: string
  icon: string
  points: number
  sort_order: number
}

export interface SessionInsert {
  child_id: string
  routine_id: string
  started_at: string
  status?: SessionStatus
}

export interface SessionUpdate {
  completed_at?: string
  duration_seconds?: number
  points_earned?: number
  status?: SessionStatus
}

// Routine with tasks for display
export interface RoutineWithTasks extends Routine {
  tasks: Task[]
}

// Claude API response for routine suggestion
export interface SuggestedRoutine {
  routineName: string
  routineType: 'morning' | 'evening' | 'homework' | 'custom'
  explanation: string
  tasks: Array<{
    name: string
    icon: string
    points: number
  }>
}
