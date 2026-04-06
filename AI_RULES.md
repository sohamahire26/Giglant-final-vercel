# AI Rules & Tech Stack

This document outlines the technical architecture and coding standards for the Giglant project.

## Tech Stack

- **Framework**: React 18 with TypeScript and Vite for fast development and type safety.
- **Styling**: Tailwind CSS for utility-first styling, following a "warm" design system defined in `index.css`.
- **UI Components**: shadcn/ui (Radix UI primitives) for accessible, unstyled components that are customized locally.
- **Routing**: React Router DOM (v6) for client-side navigation.
- **State Management & Data Fetching**: TanStack Query (React Query) for server state; React hooks for local state.
- **Backend**: Supabase for database (PostgreSQL), Authentication, and Edge Functions (Deno).
- **Icons**: Lucide React for a consistent and lightweight icon set.
- **Animations**: Framer Motion for smooth transitions and micro-interactions.
- **Forms**: React Hook Form combined with Zod for schema-based validation.
- **File Processing**: `pdfjs-dist` for PDF text extraction and `exifr` for image metadata analysis directly in the browser.

## Library Usage Rules

- **UI Components**: Always check `src/components/ui/` before creating new components. Use shadcn/ui patterns.
- **Icons**: Exclusively use `lucide-react`. Do not install other icon libraries.
- **Styling**: Use Tailwind utility classes. Avoid writing custom CSS unless defining new theme variables in `src/index.css`.
- **Data Fetching**: Use Supabase client directly for project-related CRUD operations. Use the `apiCall` utility in `src/lib/api.ts` for Edge Function interactions (e.g., Blog).
- **Navigation**: Use the custom `NavLink` component from `src/components/NavLink.tsx` for consistent active state styling.
- **Notifications**: Use the `useToast` hook from `src/hooks/use-toast.ts` or `sonner` for user feedback.
- **Layout**: All pages must be wrapped in the `Layout` component from `src/components/Layout.tsx` and include `SEOHead` for metadata.
- **File Paths**: 
  - Pages go in `src/pages/`.
  - Shared components go in `src/components/`.
  - Feature-specific components (like workspace tabs) go in subdirectories like `src/components/workspace/`.