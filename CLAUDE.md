# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `yarn dev` - Start the Next.js development server on http://localhost:3000
- `yarn build` - Build the production application
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint for code quality checks

## Project Overview

Release Current is a SaaS product that helps organizations manage the release lifecycle of their software products. It tracks releases from development completion through QA, deployment, and final release, facilitating collaboration between teams.

## Architecture

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth with middleware-based protection
- **External APIs:** Jira (issue tracking), GitHub (code changes via GitHub App)
- **Form Handling:** React Hook Form with Zod validation
- **Rich Text:** TipTap editor

### Core Data Model

The application follows a hierarchical structure:

1. **Organizations** - Top-level entity that owns projects and users
2. **Users** - Can belong to multiple organizations via `org_members` table
3. **Projects** - Belong to organizations, contain configuration like GitHub repositories
4. **Versions** - The core entity being tracked through the release lifecycle, tied to projects
5. **Version Issues** - Jira issues associated with a version, with build status tracking
6. **Version Workflows** - Deployment checklists for different environments

### Key Architectural Patterns

**Authentication & Authorization:**
- Middleware (`middleware.js`) handles auth using Supabase session checks
- Protected routes redirect to `/login` if no session exists
- Server components use `lib/supabase/server.ts` for auth
- Client components use `lib/supabase/client.js` for auth
- `OrganizationContext` provides organization-scoped data throughout the app

**API Route Structure:**
- `/api/releases/*` - Version/release management (create, read, update)
- `/api/jira/*` - Fetch issues from Jira filtered by fix version
- `/api/github/compare/*` - Compare code changes between releases using GitHub API
- `/api/version-issues/*` - Manage issue-to-version associations and build status
- `/api/organisation/*` - Organization data and config

**External Integrations:**
- **Jira:** Uses Basic Auth (email + API token) to fetch issues via JQL queries
- **GitHub:** Uses GitHub App authentication (App ID + private key) with Octokit
- GitHub integration compares commits between releases and links them to Jira issues

**Type System:**
- `types/supabase.ts` - Auto-generated database types from Supabase schema
- `types/jira/` - Jira API response types
- `types/github/` - GitHub API response types
- `types/buildStatus.ts` - Custom types for build status tracking

### Important Patterns

**Build Status Determination (`utils/buildStatus.ts`):**
- Cross-references Jira issues with GitHub commits
- Determines if issues are included in the build by checking commit messages
- Allows manual override of build status via `version_issues.build_status`

**Slug Generation:**
- Uses `utils/slugify.ts` to create URL-safe slugs
- Format: `{project_name}-{version_name}` normalized to lowercase with dashes

**Commit Annotation System:**
- Tracks commits that lack Jira references via `version_commit_checks` table
- Allows reviewers to annotate why commits are safe to include
- Visual indicators show when all unlinked commits are reviewed

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_JIRA_URL` - Jira instance URL
- `NEXT_PUBLIC_JIRA_API_KEY` - Jira API token
- `NEXT_PUBLIC_JIRA_EMAIL` - Jira user email for auth
- `NEXT_PUBLIC_JIRA_PROJECT_KEY` - Jira project key to filter issues
- `NEXT_PUBLIC_GITHUB_APP_ID` - GitHub App ID
- `NEXT_PUBLIC_GITHUB_PRIVATE_KEY` - GitHub App private key (PKCS1 format, converted to PKCS8 at runtime)

## File Structure Conventions

- `app/` - Next.js App Router pages and layouts
- `app/api/` - API routes (Next.js Route Handlers)
- `components/` - React components organized by feature
- `lib/` - Third-party service clients (Supabase, etc.)
- `utils/` - Pure utility functions
- `types/` - TypeScript type definitions
- `contexts/` - React Context providers
- `hooks/` - Custom React hooks
- `migrations/` - Database migration scripts

## Path Aliases

Use `@/*` to import from the root directory:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
```
