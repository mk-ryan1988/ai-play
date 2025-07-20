-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extending Supabase auth)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Organizations and their custom statuses
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE org_statuses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#666666',
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(org_id, name)
);

-- Organization Members
CREATE TABLE org_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(org_id, user_id)
);

-- Organization configuration
CREATE TABLE org_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(org_id, key)
);

-- Projects and Versions with flexible status
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  repositories text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL, -- Free-form status that matches org_statuses
  version_number text,
  hotfix boolean NOT NULL DEFAULT false,
  caused_by uuid REFERENCES versions(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  prepared_at timestamptz,
  release_at timestamptz,
  released_at timestamptz,
  UNIQUE(project_id, name),
  UNIQUE(project_id, version_number),
  UNIQUE(slug)
);

-- Version Issues
CREATE TABLE version_issues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id uuid REFERENCES versions(id) ON DELETE CASCADE,
  issue_key text NOT NULL,
  build_status text DEFAULT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Version workflows
CREATE TABLE version_workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template boolean NOT NULL DEFAULT false,
  version_id uuid REFERENCES versions(id) ON DELETE CASCADE,
  environment text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
