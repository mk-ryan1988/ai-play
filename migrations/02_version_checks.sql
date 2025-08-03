-- Create table for tracking version checks
CREATE TABLE public.version_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version_id UUID REFERENCES public.versions(id) ON DELETE CASCADE,
    repository TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    note TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(version_id, commit_sha)
);
