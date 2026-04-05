-- MissionControl React - Supabase Tables Setup
-- Paste this in: Supabase Dashboard → SQL Editor → New Query → Run

-- 1. tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority TEXT DEFAULT 'medium',
  assignee TEXT DEFAULT 'rahul',
  status TEXT DEFAULT 'backlog',
  estimate TEXT DEFAULT '1d',
  due_date DATE,
  subtasks JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  project_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  owner TEXT DEFAULT 'rahul',
  progress INTEGER DEFAULT 0,
  tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  type TEXT DEFAULT 'meeting',
  color TEXT DEFAULT '#19c3ff',
  recurring BOOLEAN DEFAULT false,
  repeat_rule JSONB,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. team
CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  department TEXT DEFAULT 'All',
  status TEXT DEFAULT 'offline',
  avatar_color TEXT DEFAULT '#19c3ff',
  stats JSONB DEFAULT '{"efficiency": 85, "tasksAssigned": 0, "tasksCompleted": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. memories
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. docs
CREATE TABLE IF NOT EXISTS docs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  folder TEXT DEFAULT 'root',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. activities
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'task',
  icon TEXT DEFAULT '▣',
  action TEXT,
  time TEXT DEFAULT 'just now',
  unread BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  extra JSONB DEFAULT '{}'
);

-- Enable Realtime (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Enable RLS (Row Level Security) - allow anon access for now
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (we're in dev mode)
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON activities FOR ALL USING (true) WITH CHECK (true);

-- Seed initial team data
INSERT INTO team (id, name, role, department, status, avatar_color, stats) VALUES
  ('t1', 'Rahul', 'Product Manager', 'Product', 'online', '#3B82F6', '{"efficiency": 92, "tasksAssigned": 0, "tasksCompleted": 0}'),
  ('t2', 'Aria', 'AI Assistant', 'Engineering', 'online', '#8B5CF6', '{"efficiency": 98, "tasksAssigned": 0, "tasksCompleted": 0}');
