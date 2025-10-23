# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `yarn dev` - Start the Next.js development server on http://localhost:3000
- `yarn build` - Build the production application
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint for code quality checks

## Project Overview

This is a Next.js application with Supabase authentication and a rich text editor. The application provides a foundation for building features with organization management, user authentication, and content editing capabilities.

## Architecture

### Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth with middleware-based protection
- **Form Handling:** React Hook Form with Zod validation
- **Rich Text:** TipTap editor
- **UI Components:** Headless UI, Heroicons

### Core Data Model

The application follows a hierarchical structure:

1. **Organizations** - Top-level entity that owns users
2. **Users** - Can belong to multiple organizations via `org_members` table

### Key Architectural Patterns

**Authentication & Authorization:**
- Middleware (`middleware.js`) handles auth using Supabase session checks
- Protected routes can be configured in middleware to redirect to `/login` if no session exists
- Server components use `lib/supabase/server.ts` for auth
- Client components use `lib/supabase/client.js` for auth
- `OrganizationContext` provides organization-scoped data throughout the app via `/api/organisation`
- `DialogContext` manages modal dialogs globally across the application

**API Route Structure:**
- `/api/organisation` - Organization data and config
- `/api/pokemon` - Example/test API route

**Type System:**
- `types/supabase.ts` - Auto-generated database types from Supabase schema

### Important Patterns

**Rich Text Editor:**
- Uses TipTap with custom extensions for placeholders, task items, and task lists
- Includes custom suggestion/command system in `components/editor/suggestion/`
- Main editor component at `components/editor/TextEditor.tsx`

**Form Handling:**
- React Hook Form with Zod validation for type-safe form handling
- Example implementation in `app/organizations/new/page.tsx`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

See `.env.local.example` for a template.

## File Structure Conventions

- `app/` - Next.js App Router pages and layouts
- `app/api/` - API routes (Next.js Route Handlers)
- `components/` - React components organized by feature
  - `components/editor/` - TipTap rich text editor and extensions
  - `components/ui/` - Reusable UI components (Button, Badge, Menu, etc.)
  - `components/Navigation/` - Navigation components (Sidenav)
- `lib/` - Third-party service clients (Supabase)
- `utils/` - Pure utility functions
- `types/` - TypeScript type definitions
- `contexts/` - React Context providers (OrganizationContext, DialogContext)
- `hooks/` - Custom React hooks

## Path Aliases

Use `@/*` to import from the root directory:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
```
