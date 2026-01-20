-- Quick Routine Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ============================================
-- Tables
-- ============================================

-- families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families NOT NULL,
  name TEXT NOT NULL,
  age INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families NOT NULL,
  name TEXT NOT NULL,
  routine_type TEXT NOT NULL, -- morning, evening, homework, custom
  created_at TIMESTAMPTZ DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji
  points INT NOT NULL DEFAULT 10,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children NOT NULL,
  routine_id UUID REFERENCES routines NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  points_earned INT,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- families: user can only see/manage their own
-- USING = applies to SELECT, UPDATE, DELETE (existing rows)
-- WITH CHECK = applies to INSERT, UPDATE (new/modified rows)
CREATE POLICY "Users manage own family" ON families
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- children: through family_id
CREATE POLICY "Users manage own children" ON children
  FOR ALL
  USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
  WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- routines: through family_id
CREATE POLICY "Users manage own routines" ON routines
  FOR ALL
  USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()))
  WITH CHECK (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- tasks: through routine -> family
CREATE POLICY "Users manage own tasks" ON tasks
  FOR ALL
  USING (routine_id IN (
    SELECT id FROM routines WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (routine_id IN (
    SELECT id FROM routines WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ));

-- sessions: through child -> family
CREATE POLICY "Users manage own sessions" ON sessions
  FOR ALL
  USING (child_id IN (
    SELECT id FROM children WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (child_id IN (
    SELECT id FROM children WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ));

-- ============================================
-- Seed Data (Optional - for testing)
-- ============================================

-- After creating a test user via signup, run this to seed data:
-- Replace <user_id> and <family_id> with actual values

/*
-- Create family (done automatically on signup)
-- INSERT INTO families (user_id, name, email)
-- VALUES ('<user_id>', 'Test Family', 'test@quickroutine.app');

-- Create child
INSERT INTO children (family_id, name, age)
VALUES ('<family_id>', 'Emma', 7);

-- Create routine
INSERT INTO routines (id, family_id, name, routine_type)
VALUES (gen_random_uuid(), '<family_id>', 'Morning Routine', 'morning')
RETURNING id;

-- Create tasks (use the routine_id from above)
INSERT INTO tasks (routine_id, name, icon, points, sort_order) VALUES
('<routine_id>', 'Wake up and stretch', '🌅', 5, 1),
('<routine_id>', 'Brush teeth', '🦷', 10, 2),
('<routine_id>', 'Get dressed', '👕', 10, 3),
('<routine_id>', 'Eat breakfast', '🥣', 15, 4),
('<routine_id>', 'Pack backpack', '🎒', 10, 5);
*/
