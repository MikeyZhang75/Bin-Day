# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo application called "bin-day" that helps users find waste collection information for their addresses. Built with Expo Router (v5), React Native 0.79.5, and TypeScript, the app uses Convex as a backend service and follows Expo's file-based routing pattern.

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
- `bun run check:fix` - Run Biome format and lint with automatic fixes
- `bun run check-types` - Run TypeScript type checking
- `bun run build:simulator:ios` - Build for iOS simulator using EAS

### Code Quality

The project uses both ESLint and Biome for code quality:

1. **ESLint**: `bun run lint` - Uses eslint-config-expo with flat config
2. **Biome**: `bunx @biomejs/biome check .` - For formatting and additional linting
   - Format: `bunx @biomejs/biome format --write .`
   - Lint: `bunx @biomejs/biome lint .`
   - Both: `bunx @biomejs/biome check --write .` or `bun run check:fix`

Note: Biome is configured with tab indentation and double quotes for strings.

## Architecture

### Routing Structure

The app uses Expo Router's file-based routing:

- `app/_layout.tsx` - Root layout with theme provider, font loading, and Convex provider
- `app/(tabs)/_layout.tsx` - Tab navigation layout with Home, Explore, and Search tabs
- `app/(tabs)/index.tsx` - Home tab screen
- `app/(tabs)/explore.tsx` - Explore tab screen
- `app/(tabs)/search.tsx` - Search tab screen with Google Places integration
- `app/+not-found.tsx` - 404 screen

### Key Architectural Patterns

1. **State Management**

   - Uses Zustand for global state management (`stores/appStore.ts`)
   - Structured into search, address, and council data states
   - Devtools integration for debugging

2. **Theming System**

   - Dark/light mode support via `useColorScheme` hook
   - Themed components in `components/` (ThemedText, ThemedView)
   - Color definitions in `constants/Colors.ts`

3. **Animation System**

   - Unified animation system using React Native Reanimated 3
   - Consistent bezier curves `(0.25, 0.1, 0.25, 1)` across all animations
   - Standard duration of 350ms with smooth transitions
   - Custom `useAnimations` hook for coordinated animations
   - Memory management with animation cleanup on unmount
   - See `docs/ANIMATION_SYSTEM.md` for detailed documentation

4. **Component Organization**

   - UI components in `components/ui/` (platform-specific implementations)
   - Reusable components directly in `components/`:
     - `SwipeableModal.tsx` - Customizable modal with swipe-to-dismiss, animated overlay, render prop support, theme-aware drag indicator, and configurable animation constants
     - `UnsupportedCouncilCard.tsx` - Card component for displaying unsupported council information
   - Search components in `components/search/`:
     - `SearchResults.tsx` - Optimized FlatList with memoization and performance enhancements
     - `SearchResultItem.tsx` - Individual search result display
   - Waste components in `components/waste/`:
     - `WasteCard.tsx` - Individual waste collection date display
     - `WasteCollectionGrid.tsx` - Grid layout for waste cards
   - Custom hooks in `hooks/`:
     - `useAddressSearch.ts` - Address search logic with debouncing
     - `useAnimations.ts` - Animation management
     - `useCouncilData.ts` - Council data fetching

5. **Platform-Specific Code**

   - `.ios.tsx` and `.tsx` file extensions for platform variants
   - Platform.select() for inline platform branching

6. **TypeScript Configuration**

   - Strict mode enabled
   - Path alias `@/*` maps to project root
   - Typed routes via Expo's experimental feature

7. **Convex Backend**
   - Generated types in `convex/_generated/`
   - Backend functions in `convex/` directory:
     - `councilServices.ts` - Council data fetching logic with WasteCollectionDates type
     - `councils/index.ts` - Central export file for council-related modules
     - `councils/types.ts` - Council types, constants, and validation utilities
     - `councils/errors.ts` - Standardized error classes and utilities for council implementations
     - `councils/[councilName].ts` - Individual council implementations
     - `googlePlaces.ts` - Google Places API integration
   - Use Convex React hooks for data fetching

### External API Integrations

1. **Google Places API**

   - Autocomplete for address search
   - Place details fetching
   - Configured in `convex/googlePlaces.ts`

2. **Council APIs**
   - Individual council implementations in `convex/councils/`
   - Extensible pattern for adding more councils
   - Error handling with custom error classes

### Utilities

- `lib/addressExtractor.ts` - Extract address components from Google Places data and format search addresses (supports council-specific formatting)
- `lib/distance.ts` - Calculate distances between coordinates
- `lib/env.ts` - Environment variable validation with envalid

## GitHub Actions

The project uses GitHub Actions for automated code review:

- **Claude Code Review** (`.github/workflows/claude-code-review.yml`):
  - Runs on pull requests
  - Performs type checking, linting, and Biome formatting checks
  - Only runs Claude review if all checks pass
  - Provides helpful job summaries on failure

## Performance Optimizations

- **FlatList Optimization**: Search results use memoized callbacks and `removeClippedSubviews`
- **Animation Cleanup**: Proper cleanup of animations on component unmount
- **Debounced Search**: Address search with 100ms debounce to reduce API calls

## Development Guidelines

1. **Import Paths**: Always use the `@/` alias for imports (e.g., `@/components/ThemedView`)

2. **Styling**: Follow existing patterns using StyleSheet.create() and theme-aware colors

3. **New Features**: When adding new screens, create them in the appropriate directory under `app/` to maintain routing structure

4. **Backend Integration**: Define Convex functions in the `convex/` directory and use generated types from `convex/_generated/`

5. **Testing**: No test framework is currently configured. If tests are needed, suggest setting up Jest with React Native Testing Library.

6. **Environment Variables**:

   - Use `envalid` for validation in `lib/env.ts`
   - Prefix client-side variables with `EXPO_PUBLIC_`
   - Store sensitive API keys in Convex environment variables

7. **Git Branch Naming Convention**:

   - `feat/` - for new features (e.g., `feat/add-baw-baw-shire-council`)
   - `fix/` - for bug fixes (e.g., `fix/address-search-error`)
   - `chore/` - for maintenance tasks (e.g., `chore/update-dependencies`)
   - `docs/` - for documentation (e.g., `docs/api-integration-guide`)
   - Use hyphens to separate words in branch names

8. **Component Best Practices**:
   - Use React.memo with display names for performance optimization
   - Implement proper TypeScript types for all props
   - Follow the existing animation patterns using Reanimated 3

## Adding a New Council

1. Create a new file in `convex/councils/[councilName].ts`
2. Implement the `fetch[CouncilName]Data` function following the existing pattern
3. Add the council to the `SUPPORTED_COUNCILS` array in `convex/councils/types.ts`
4. Add the council handler to `convex/councilServices.ts`
5. Update the supported councils list in README.md

## Environment Setup

The project includes:

- Expo SDK 53
- React 19.0.0
- React Native 0.79.5
- TypeScript 5.8.3
- Convex 1.25.2
- React Native Reanimated 3.17.5
- Zustand 5.0.2 (state management)
- Biome 2.1.1 (for formatting/linting)
- Luxon 3.5.0 (for date/time handling)
- envalid 8.0.0 (for environment validation)
- uuid 11.0.5 (for generating unique identifiers)

## Development Warnings

- Do not run `bun run dev`, `bunx convex dev` or any related server starting command.
- Do not run `git` related bash commands UNDER ANY CIRCUMSTANCES, unless I instructed you to do so.

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
