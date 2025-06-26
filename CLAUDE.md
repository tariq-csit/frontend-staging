# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## Architecture Overview

This is a React + TypeScript + Vite application for a penetration testing management platform called "Slash". The application handles multiple user roles (admin, pentester, client) with role-based access control and integrates with external services like Jira.

### Key Architecture Components

**Authentication & Authorization:**
- Role-based access control with three user types: `admin`, `pentester`, `client`
- Route protection using custom wrapper components (`AdminProtectedRoute`, `ClientProtectedRoute`, etc.)
- JWT-based authentication with 2FA support
- User context managed via `useUser` hook and React Query

**State Management:**
- React Query (`@tanstack/react-query`) for server state management
- Custom contexts for UI state (SidebarContext, ThemeContext)
- No global state management library - relies on React Query caching

**UI Framework:**
- Tailwind CSS for styling
- Radix UI components for accessible primitives
- shadcn/ui component library built on top of Radix
- Custom theme provider with dark/light mode support

**File Structure:**
- `src/components/` - Feature-based component organization (auth, dashboard, pentests, etc.)
- `src/hooks/` - Custom React hooks including `useUser` for authentication
- `src/lib/` - Utilities, Axios instance, and API route definitions
- `src/types/` - TypeScript type definitions for all entities
- Route definitions centralized in `src/lib/routes.ts`

**Data Flow:**
- All API calls use centralized `axiosInstance` from `src/lib/AxiosInstance.ts`
- API routes defined in `src/lib/routes.ts` with role-specific endpoints
- React Query handles caching, background updates, and error states
- File uploads handled through dedicated upload endpoints

**Key Features:**
- Vulnerability management with CVSS scoring and status tracking
- PDF report generation and management (pentest/retest reports)
- Jira integration for vulnerability tracking
- Real-time activity feeds and dashboard metrics
- File attachment system for vulnerabilities and pentests

**Path Alias:**
- `@/` maps to `./src/` for cleaner imports

**Role-based Feature Access:**
- Admin: Full access to all features, user management, pentest creation
- Pentester: Access to assigned pentests, vulnerability reporting
- Client: View pentests, vulnerability status, Jira integration