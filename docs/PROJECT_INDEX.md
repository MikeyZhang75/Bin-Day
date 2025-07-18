# Bin Day Project Index

## Project Overview

**Name**: Bin Day  
**Type**: React Native Expo Application  
**Purpose**: Help users find waste collection information for their addresses in Victoria, Australia  
**Stack**: React Native 0.79.5, Expo SDK 53, TypeScript 5.8.3, Convex Backend

## Directory Structure

```
bin-day/
├── app/                      # Expo Router screens
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Main home screen (simplified UI)
│   └── +not-found.tsx       # 404 error screen
├── components/              # React components
│   ├── address/             # Address-related components
│   │   └── AddressDisplay.tsx
│   ├── common/              # Common/shared components
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── search/              # Search functionality
│   │   ├── SearchBar.tsx    # Animated search input
│   │   └── SearchResults.tsx # Dropdown results
│   ├── ui/                  # Platform-specific UI components
│   │   └── IconSymbol.tsx
│   ├── waste/               # Waste collection components
│   │   └── WasteCollectionGrid.tsx
│   ├── ThemedText.tsx       # Theme-aware text component
│   ├── ThemedView.tsx       # Theme-aware view component
│   └── UnsupportedCouncilCard.tsx
├── constants/               # App constants
│   └── Colors.ts           # Theme color definitions
├── convex/                  # Backend functions
│   ├── _generated/          # Auto-generated Convex types
│   ├── councils/            # Council implementations
│   │   ├── index.ts         # Council exports
│   │   ├── types.ts         # Council types & validation
│   │   ├── errors.ts        # Error handling
│   │   ├── alpineShire.ts   # Alpine Shire
│   │   ├── ballarat.ts      # City of Ballarat
│   │   ├── banyule.ts       # Banyule City
│   │   ├── bayside.ts       # Bayside City
│   │   ├── bawBawShire.ts   # Baw Baw Shire
│   │   ├── campaspe.ts      # Campaspe Shire
│   │   ├── dandenong.ts     # Greater Dandenong
│   │   ├── gannawarra.ts    # Gannawarra Shire
│   │   └── monash.ts        # City of Monash
│   ├── councilServices.ts   # Council service logic
│   └── googlePlaces.ts      # Google Places API
├── docs/                    # Documentation
│   ├── ANIMATION_SYSTEM.md  # Animation documentation
│   └── PROJECT_INDEX.md     # This file
├── hooks/                   # Custom React hooks
│   ├── useAddressSearchZustand.ts
│   ├── useAnimations.ts     # Unified animation system
│   ├── useCouncilDataZustand.ts
│   └── useThemeColor.ts
├── lib/                     # Utility functions
│   ├── addressExtractor.ts  # Address parsing
│   ├── distance.ts          # Distance calculations
│   └── env.ts              # Environment validation
├── stores/                  # State management
│   └── appStore.ts         # Zustand store
├── types/                   # TypeScript definitions
│   ├── council.ts          # Council types
│   └── googlePlaces.ts     # Google Places types
├── .gitignore
├── app.json                # Expo configuration
├── biome.json              # Biome formatter config
├── CLAUDE.md               # Claude AI instructions
├── eslint.config.js        # ESLint configuration
├── package.json
├── README.md
└── tsconfig.json           # TypeScript config
```

## Key Features

### 1. Address Search

- Google Places Autocomplete integration
- Australian address filtering
- Real-time search with debouncing
- Smooth animations for search interactions

### 2. Council Integration

**Supported Councils** (9 total):

- Alpine Shire
- Banyule City
- Bayside City
- Baw Baw Shire
- Campaspe Shire
- City of Ballarat
- City of Monash
- Gannawarra Shire
- Greater Dandenong City

**Waste Types**:

- Landfill/Garbage
- Recycling
- Food & Garden Organics
- Glass Recycling (where available)
- Hard Waste

### 3. Animation System

- **Framework**: React Native Reanimated 3
- **Easing**: Bezier curve `(0.25, 0.1, 0.25, 1)`
- **Standard Duration**: 350ms
- **Animations**:
  - Search input focus (border & icon)
  - Search results dropdown
  - Blur overlay effects
  - Empty state transitions
  - Content fade-in

### 4. UI/UX Improvements

- **Simplified Interface**: Removed header for more content space
- **Conditional Rendering**: Search hides when address selected
- **Smooth Transitions**: No flashing or abrupt changes
- **Reduced Blur**: Subtle background effects (intensity 12)
- **Theme Support**: Dark/light mode with system detection

## State Management

### Zustand Store Structure

```typescript
AppStore {
  search: {
    query: string
    results: GooglePrediction[]
    isSearching: boolean
    isFocused: boolean
    showResults: boolean
  }
  address: {
    selected: GooglePrediction | null
    placeDetails: GooglePlaceDetails | null
    council: string | null
    unsupportedCouncil: string | null
  }
  sessionToken: string | null
}
```

## Recent Changes

### UI Enhancements

1. **Search Input Animations**: Smooth border and icon color transitions
2. **Blur Reduction**: Decreased intensity from 20 to 12
3. **Header Removal**: Eliminated title/subtitle for cleaner interface
4. **Conditional Search**: Input hides when address is selected
5. **Animation Timing**: Extended durations to prevent flashing

### Technical Improvements

1. **Unified Animation System**: Consistent bezier curves across all animations
2. **Performance Optimization**: Efficient use of Reanimated worklets
3. **Code Quality**: ESLint + Biome for formatting and linting
4. **Type Safety**: Strict TypeScript configuration

## Development Workflow

### Commands

```bash
# Development
bun run start      # Start Expo dev server
bun run ios        # Run on iOS simulator
bun run android    # Run on Android
bun run web        # Run in browser

# Code Quality
bun run lint       # ESLint check
bun run check:fix  # Biome format & lint
bun run check-types # TypeScript check
```

### Git Workflow

- **Branches**: `feat/`, `fix/`, `chore/`, `docs/`
- **Current Branch**: `feat/victorian-councils-ui-overhaul`
- **Commit Style**: Conventional commits with descriptive messages

## API Integrations

### Google Places API

- Autocomplete predictions
- Place details fetching
- Session token management
- Australian address filtering

### Council APIs

- Direct integration with council waste services
- Error handling with fallbacks
- Address formatting per council requirements
- Real-time data fetching

## Configuration Files

### Key Configs

- **app.json**: Expo app configuration
- **tsconfig.json**: TypeScript settings with strict mode
- **biome.json**: Tab indentation, double quotes
- **eslint.config.js**: Expo ESLint config
- **CLAUDE.md**: AI assistant instructions

### Environment Variables

- Managed via Convex environment settings
- Client variables prefixed with `EXPO_PUBLIC_`
- Validated using envalid library

## Performance Considerations

### Animation Performance

- UI thread animations via Reanimated
- Shared values for optimal updates
- No manual cleanup required
- Platform-specific optimizations

### Bundle Size

- Tree-shaking enabled
- Lazy loading for council modules
- Minimal external dependencies

## Future Enhancements

### Potential Features

1. More Victorian council integrations
2. Push notifications for bin days
3. Calendar integration
4. Offline support
5. Widget support (iOS/Android)

### Technical Debt

1. Add comprehensive test suite
2. Implement error tracking (Sentry)
3. Add analytics
4. Performance monitoring
5. Accessibility audit

## Documentation

### Available Docs

- `/README.md` - Project overview
- `/CLAUDE.md` - AI assistant guide
- `/docs/ANIMATION_SYSTEM.md` - Animation details
- `/docs/PROJECT_INDEX.md` - This comprehensive index

### Code Documentation

- TypeScript interfaces for all data structures
- JSDoc comments for complex functions
- Inline comments for non-obvious logic
- Component prop documentation

## Deployment

### Platform Support

- iOS 13.4+
- Android 6.0+
- Web (modern browsers)

### Build Process

```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Maintenance

### Regular Tasks

1. Update council API integrations
2. Monitor API usage and limits
3. Update dependencies monthly
4. Review and optimize animations
5. Address user feedback

### Monitoring

- Convex dashboard for backend metrics
- Google Cloud Console for Places API
- App Store Connect for iOS metrics
- Google Play Console for Android metrics
