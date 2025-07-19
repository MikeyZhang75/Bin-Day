# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"bin-day" is a React Native Expo application that helps Victorian residents find waste collection information for their addresses. The app integrates with various Victorian council APIs to provide real-time waste collection dates, supporting multiple waste types including landfill, recycling, organics, hard waste, and glass recycling.

**Tech Stack**:

- React Native 0.79.5 with Expo SDK 53
- TypeScript 5.8.3 with strict mode
- Expo Router 5.1.3 for file-based routing
- Convex 1.25.2 for backend services
- Zustand 5.0.2 for state management
- React Native Reanimated 3.17.4 for animations
- Luxon 3.7.1 for date handling

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

## Project Structure

### Configuration Files

- **package.json**: Project metadata, scripts, and dependencies
- **tsconfig.json**: TypeScript configuration with strict mode and `@/*` path alias
- **biome.json**: Code formatting and linting rules (tab indentation, double quotes)
- **eslint.config.js**: ESLint configuration using expo preset
- **app.json**: Expo configuration with app metadata, build settings, and plugins
- **eas.json**: EAS build profiles for development, preview, and production
- **.vscode/settings.json**: VSCode settings for Biome integration

### App Entry Points

- **app/\_layout.tsx**: Root layout providing Convex client, theme provider, and font loading
- **app/index.tsx**: Main home screen with address search and waste collection display
- **app/+not-found.tsx**: 404 error screen

### Components Structure

#### Core Components

- **ThemedText.tsx**: Text component with theme support and typography variants
- **ThemedView.tsx**: View component with automatic theme-based background colors
- **SwipeableModal.tsx**: Swipeable bottom sheet modal with gesture support
- **HapticTab.tsx**: Tab component with haptic feedback (iOS only)
- **UnsupportedCouncilCard.tsx**: Card for displaying unsupported council messages

#### Address Components (`components/address/`)

- **AddressDisplay.tsx**: Displays selected address with council information

#### Common Components (`components/common/`)

- **EmptyState.tsx**: Empty state UI with search prompt
- **ErrorBoundary.tsx**: React error boundary for error handling
- **ErrorMessage.tsx**: Error message display with retry option

#### Search Components (`components/search/`)

- **SearchBar.tsx**: Animated search input with focus states
- **SearchResults.tsx**: Optimized FlatList for search results
- **SearchResultItem.tsx**: Individual search result item

#### Waste Components (`components/waste/`)

- **WasteCard.tsx**: Individual waste collection card with date display
- **WasteCollectionGrid.tsx**: Grid layout for waste collection cards

#### UI Components (`components/ui/`)

- **IconSymbol.tsx**: Cross-platform icon component (Material Icons)
- **IconSymbol.ios.tsx**: iOS-specific SF Symbols implementation
- **TabBarBackground.tsx**: Tab bar background (Android/Web)
- **TabBarBackground.ios.tsx**: iOS blur tab bar background

### Custom Hooks

- **useColorScheme.ts**: Platform-specific color scheme detection
- **useColorScheme.web.ts**: Web-specific color scheme with hydration support
- **useThemeColor.ts**: Theme color resolution hook
- **useAddressSearch.ts**: Address search logic with Google Places integration
- **useAnimations.ts**: Unified animation management with Reanimated
- **useCouncilData.ts**: Council data fetching and caching
- **useWasteSorting.ts**: Waste collection date sorting logic

### State Management

- **stores/appStore.ts**: Zustand store with three main slices:
  - **search**: Search query, results, focus state, session token
  - **address**: Selected address, place details, council information
  - **councilData**: Waste collection data, loading states, errors

### Utilities

- **constants/Colors.ts**: Theme color definitions for light/dark modes
- **lib/addressExtractor.ts**: Extract and format address components from Google Places
- **lib/distance.ts**: Haversine formula for distance calculations
- **lib/env.ts**: Environment variable validation using Zod
- **utils/dateFormatters.ts**: Date formatting utilities for waste collection dates
- **types/googlePlaces.ts**: TypeScript types for Google Places API

### Backend Services (Convex)

#### Core Services

- **googlePlaces.ts**: Google Places API integration (autocomplete, place details)
- **councilServices.ts**: Main council data fetching orchestrator

#### Council Core (`convex/councils/core/`)

- **types.ts**: Council names constants and validation
- **errors.ts**: Standardized error classes (CouncilAPIError, AddressNotFoundError)
- **addressFormatter.ts**: Council-specific address formatting
- **index.ts**: Core module exports

#### Council Providers (`convex/councils/providers/`)

Third-party API integrations organized by provider:

##### Granicus Provider (`providers/granicus/`)

- **index.ts**: Re-exports all provider functionality
- **api.ts**: Main API functions (processGranicusCouncilData, searchGranicusAddress, fetchGranicusWasteServices)
- **types.ts**: Granicus-specific types (GranicusApiResponse, WasteTypeRegexPatterns)
- **parser.ts**: HTML parsing utilities for waste collection dates
- **constants.ts**: API headers and endpoint patterns

##### WhatBinDay Provider (`providers/whatbinday/`)

- **index.ts**: Re-exports all provider functionality
- **api.ts**: Main API function (processWhatBinDayCouncilData)
- **constants.ts**: API URLs, headers, and API keys
- **types.ts**: WhatBinDay-specific types (WhatBinDayAddress, ParsedBinEvent, WhatBinDayConfig)
- **formatter.ts**: Address formatting for WhatBinDay API
- **parser.ts**: HTML parsing for waste collection dates

#### Council Implementations (`convex/councils/implementations/`)

Each council has its own implementation file using one of the available providers:

1. **Granicus Pattern** (e.g., monash.ts): Uses Granicus API via `processGranicusCouncilData`
2. **WhatBinDay Pattern** (e.g., colacOtway.ts): Uses WhatBinDay API via `processWhatBinDayCouncilData`
3. **Custom Pattern** (e.g., bawBawShire.ts): Custom API integration for unique council systems

Currently supports 33 Victorian councils with standardized waste collection data format.

### GitHub Actions

- **claude-code-review.yml**: Automated PR review with type checking, linting, and Claude analysis
- **claude.yml**: Interactive Claude bot for issue/PR comments

## Architecture Patterns

### 1. State Management Architecture

The app uses Zustand with a clear separation of concerns:

- **Search State**: Manages address search functionality
- **Address State**: Stores selected address and council information
- **Council Data State**: Handles waste collection data fetching

### 2. Animation System

Unified animation system using React Native Reanimated 3:

- Consistent bezier curves `(0.25, 0.1, 0.25, 1)`
- Standard 350ms duration
- Coordinated animations through `useAnimations` hook
- Proper cleanup on unmount to prevent memory leaks

### 3. Component Patterns

- **Memoization**: React.memo for performance optimization
- **Display Names**: All memoized components have display names
- **TypeScript**: Strict typing for all props and state
- **Platform-Specific**: `.ios.tsx` extensions for iOS-specific code

### 4. Error Handling

- **Error Boundaries**: Catch and display React errors gracefully
- **API Errors**: Standardized error classes for council APIs
- **User Feedback**: Clear error messages with retry options

### 5. Performance Optimizations

- **FlatList**: Optimized with `getItemLayout`, `removeClippedSubviews`
- **Debouncing**: 100ms debounce on address search
- **Memoization**: useMemo and useCallback for expensive operations
- **Animation Cleanup**: Proper cleanup to prevent memory leaks

## API Integrations

### Google Places API

- **Autocomplete**: Address search with Victorian bounds restriction
- **Place Details**: Fetch full address components and coordinates
- **Session Tokens**: Proper session token management for billing

### Council APIs

Three main API providers:

1. **Granicus API** (Most councils)

   - Government technology platform used by ~25 Victorian councils
   - Search endpoint: `/api/v1/myarea/search`
   - Waste services endpoint: `/ocapi/Public/myarea/wasteservices`
   - Implementation: `providers/granicus/`
   - Used by: Monash, Whittlesea, Yarra Ranges, etc.

2. **WhatBinDay API** (Selected councils)

   - Third-party waste collection service
   - Single endpoint: `https://console.whatbinday.com/api/search`
   - Requires council-specific API keys
   - Implementation: `providers/whatbinday/`
   - Used by: Colac Otway

3. **Custom APIs** (Individual councils)
   - Baw Baw Shire: Custom session-based API
   - Hobsons Bay: REST API with property search
   - Each has unique implementation requirements

## Development Guidelines

### 1. Import Convention

Always use the `@/*` alias for imports:

```typescript
import { ThemedView } from "@/components/ThemedView";
```

### 2. Styling Guidelines

- Use `StyleSheet.create()` for all styles
- Use theme-aware colors from `useThemeColor`
- Follow existing component patterns

### 3. TypeScript Best Practices

- Enable strict mode checks
- Define explicit types for all props
- Use type imports where possible

### 4. Component Guidelines

- Use React.memo for list items
- Implement proper TypeScript types
- Follow animation patterns with Reanimated
- Add accessibility props (labels, hints)

### 5. Backend Integration

- Define Convex functions in `convex/` directory
- Use generated types from `convex/_generated/`
- Handle errors with standardized error classes

### 6. Environment Variables

- Client-side: Prefix with `EXPO_PUBLIC_`
- Server-side: Store in Convex environment
- Validate with Zod in `lib/env.ts`

### 7. Git Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance
- `docs/` - Documentation

### 8. Performance Considerations

- Minimize re-renders with proper memoization
- Use FlatList optimizations for lists
- Implement proper loading states
- Clean up animations on unmount

## Adding a New Council

1. **Identify API Provider**:

   - Check if council uses Granicus (most common)
   - Check if council uses WhatBinDay
   - Determine if custom implementation needed

2. **Create Implementation**: Add file in `convex/councils/implementations/[councilName].ts`

3. **Update Types**: Add council name to `COUNCIL_NAMES` in `convex/councils/core/types.ts`

4. **Register Handler**: Add handler to `councilHandlers` in `convex/councilServices.ts`

5. **Update Schema**: Add council literal to Convex schema in `councilServices.ts`

6. **Test Implementation**: Verify with real addresses

7. **Update Documentation**: Add to supported councils list

### Implementation Examples

#### Granicus Implementation (Most Common)

```typescript
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
  processGranicusCouncilData,
  type WasteTypeRegexPatterns,
} from "../providers/granicus";

const wastePatterns: WasteTypeRegexPatterns = {
  landfillWaste:
    /general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
  recycling:
    /recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
  foodAndGardenWaste:
    /green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchCouncilData(placeDetails: GooglePlaceDetails) {
  return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.COUNCIL_NAME, {
    searchApiUrl: "https://council.vic.gov.au/api/v1/myarea/search",
    wasteServicesUrl:
      "https://council.vic.gov.au/ocapi/Public/myarea/wasteservices",
    wasteTypePatterns: wastePatterns,
  });
}
```

#### WhatBinDay Implementation

```typescript
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import { processWhatBinDayCouncilData } from "../providers/whatbinday";

export async function fetchCouncilData(placeDetails: GooglePlaceDetails) {
  // Simply use the WhatBinDay provider with the council name
  // The API key is already configured in the provider's constants
  return processWhatBinDayCouncilData(placeDetails, COUNCIL_NAMES.COUNCIL_NAME);
}
```

#### Custom Implementation

```typescript
// See bawBawShire.ts or hobsonsBay.ts for examples
```

## Waste Collection Data Format

All councils return data in this standardized format:

```typescript
type WasteCollectionDates = {
  landfillWaste: number | null; // Unix timestamp
  recycling: number | null; // Unix timestamp
  foodAndGardenWaste: number | null; // Unix timestamp
  hardWaste: number | null; // Unix timestamp
  glass: number | null; // Unix timestamp
};
```

## Development Warnings

- Do not run `bun run dev`, `bunx convex dev` or any related server starting command
- Do not run `git` related bash commands UNDER ANY CIRCUMSTANCES, unless explicitly instructed
- The app currently supports Victorian councils only (locationrestriction in Google Places)

## Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
