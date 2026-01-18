import Constants from 'expo-constants'

const CLAUDE_API_KEY = Constants.expoConfig?.extra?.claudeApiKey || process.env.EXPO_PUBLIC_CLAUDE_API_KEY

const SYSTEM_PROMPT = `You are a child development expert helping parents create daily routines for their children.

When given a description of a child and their needs, create a routine with 4-6 age-appropriate tasks.

Respond in this exact JSON format (no markdown, no code blocks, just the JSON):
{
  "routineName": "string",
  "routineType": "morning" | "evening" | "homework" | "custom",
  "explanation": "Brief 1-2 sentence explanation of why this routine works",
  "tasks": [
    { "name": "Task name", "icon": "emoji", "points": 5-20 }
  ]
}

Guidelines:
- Short, action-oriented task names (3-5 words max)
- Use positive, encouraging language
- Points should reflect effort level (harder tasks = more points)
- Total routine should take 5-15 minutes
- Consider the child's age when choosing tasks
- Use fun, relevant emojis for each task
- Order tasks logically (e.g., wake up before breakfast)`

export interface SuggestedTask {
  name: string
  icon: string
  points: number
}

export interface SuggestedRoutine {
  routineName: string
  routineType: 'morning' | 'evening' | 'homework' | 'custom'
  explanation: string
  tasks: SuggestedTask[]
}

export interface ClaudeResponse {
  routine: SuggestedRoutine | null
  error: string | null
}

export async function suggestRoutine(description: string): Promise<ClaudeResponse> {
  if (!CLAUDE_API_KEY) {
    return { routine: null, error: 'Claude API key not configured' }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: description,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        routine: null,
        error: errorData.error?.message || `API error: ${response.status}`
      }
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return { routine: null, error: 'No response from Claude' }
    }

    // Parse the JSON response
    try {
      // Clean up the response - remove any markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const routine = JSON.parse(cleanedContent) as SuggestedRoutine

      // Validate the response structure
      if (!routine.routineName || !routine.tasks || !Array.isArray(routine.tasks)) {
        return { routine: null, error: 'Invalid response format from Claude' }
      }

      // Ensure all tasks have required fields
      const validTasks = routine.tasks.every(
        (task) => task.name && task.icon && typeof task.points === 'number'
      )

      if (!validTasks) {
        return { routine: null, error: 'Invalid task format in response' }
      }

      return { routine, error: null }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content)
      return { routine: null, error: 'Failed to parse routine suggestion' }
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      routine: null,
      error: error instanceof Error ? error.message : 'Failed to connect to Claude API'
    }
  }
}
