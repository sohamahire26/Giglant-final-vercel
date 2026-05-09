
-- Drop old telegram/video-related tables
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS review_comments CASCADE;
DROP TABLE IF EXISTS video_reviews CASCADE;

-- Create project management tables
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_name text,
  description text,
  work_type text DEFAULT 'general',
  share_token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  drive_folder_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_type text NOT NULL DEFAULT 'other',
  drive_url text NOT NULL,
  drive_file_id text,
  filename text NOT NULL DEFAULT 'Untitled',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE file_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  timestamp_seconds double precision,
  comment text NOT NULL,
  author_name text DEFAULT 'Client',
  is_client boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;

-- Projects: fully open (no auth for V1)
CREATE POLICY "Anyone can create projects" ON projects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update projects" ON projects FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete projects" ON projects FOR DELETE TO public USING (true);

-- Project files
CREATE POLICY "Anyone can add files" ON project_files FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view files" ON project_files FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update files" ON project_files FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete files" ON project_files FOR DELETE TO public USING (true);

-- File comments
CREATE POLICY "Anyone can add comments" ON file_comments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view comments" ON file_comments FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update comments" ON file_comments FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete comments" ON file_comments FOR DELETE TO public USING (true);

-- Trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for live comments
ALTER PUBLICATION supabase_realtime ADD TABLE file_comments;
