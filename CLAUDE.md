# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo application called "bin-day", built with Expo Router (v5), React Native 0.79.5, and TypeScript. The app uses Convex as a backend service and follows Expo's file-based routing pattern.

## Development Commands

### Package Manager

Always use Bun for all npm-related commands (as specified in user's global CLAUDE.md):

- `bun install` - Install dependencies
- `bun run <script>` - Run package.json scripts

### Core Commands

- `bun run start` - Start the Expo development server
- `bun run android` - Start on Android device/emulator
- `bun run ios` - Start on iOS simulator
- `bun run web` - Start in web browser
- `bun run lint` - Run ESLint checks
- `bun run reset-project` - Move starter code to app-example and create blank app directory

### Code Quality

The project uses both ESLint and Biome for code quality:

1. **ESLint**: `bun run lint` - Uses eslint-config-expo with flat config
2. **Biome**: `bunx @biomejs/biome check .` - For formatting and additional linting
   - Format: `bunx @biomejs/biome format --write .`
   - Lint: `bunx @biomejs/biome lint .`
   - Both: `bunx @biomejs/biome check --write .`

Note: Biome is configured with tab indentation and double quotes for strings.

## Architecture

### Routing Structure

The app uses Expo Router's file-based routing:

- `app/_layout.tsx` - Root layout with theme provider and font loading
- `app/(tabs)/_layout.tsx` - Tab navigation layout with Home and Explore tabs
- `app/(tabs)/index.tsx` - Home tab screen
- `app/(tabs)/explore.tsx` - Explore tab screen
- `app/+not-found.tsx` - 404 screen

### Key Architectural Patterns

1. **Theming System**

   - Dark/light mode support via `useColorScheme` hook
   - Themed components in `components/` (ThemedText, ThemedView)
   - Color definitions in `constants/Colors.ts`

2. **Component Organization**

   - UI components in `components/ui/` (platform-specific implementations)
   - Reusable components directly in `components/`
   - Custom hooks in `hooks/`

3. **Platform-Specific Code**

   - `.ios.tsx` and `.tsx` file extensions for platform variants
   - Platform.select() for inline platform branching

4. **TypeScript Configuration**

   - Strict mode enabled
   - Path alias `@/*` maps to project root
   - Typed routes via Expo's experimental feature

5. **Convex Backend**
   - Generated types in `convex/_generated/`
   - Backend functions should be added to `convex/` directory
   - Use Convex React hooks for data fetching

## Development Guidelines

1. **Import Paths**: Always use the `@/` alias for imports (e.g., `@/components/ThemedView`)

2. **Styling**: Follow existing patterns using StyleSheet.create() and theme-aware colors

3. **New Features**: When adding new screens, create them in the appropriate directory under `app/` to maintain routing structure

4. **Backend Integration**: Define Convex functions in the `convex/` directory and use generated types from `convex/_generated/`

5. **Testing**: No test framework is currently configured. If tests are needed, suggest setting up Jest with React Native Testing Library.

## Environment Setup

The project includes:

- Expo SDK 53
- React 19.0.0
- React Native 0.79.5
- TypeScript 5.8.3
- Convex 1.25.2
- Biome 2.1.1 (for formatting/linting)
