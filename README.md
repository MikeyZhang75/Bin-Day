# Bin Day 🗑️

A React Native app that helps Victorian residents find waste collection information for their addresses. Simply search for your address and get up-to-date bin collection dates for landfill, recycling, food & garden waste, glass, and hard waste services.

## Features

- 🔍 **Address Search**: Search for any Victorian address using Google Places Autocomplete with location restriction
- 📅 **Collection Dates**: View upcoming collection dates for all waste types with "Today" and "Tomorrow" highlighting
- 🏛️ **Council Support**: Currently supports 32 Victorian councils with more being added
- 📱 **Cross-Platform**: Works on iOS, Android, and web browsers
- 🌓 **Dark Mode**: Automatic theme switching based on device preferences
- ✨ **Smooth Animations**: Polished UI with React Native Reanimated
- 🎯 **Smart Search**: Distance-based result selection for accurate address matching

## Supported Councils

Currently supporting the following Victorian councils:

- Alpine Shire
- Banyule City
- Baw Baw Shire
- Bayside City
- Campaspe Shire
- City of Ballarat
- City of Kingston
- City of Monash
- City of Whittlesea
- Gannawarra Shire
- Greater Dandenong City
- Greater Shepparton City
- Hume City
- Loddon Shire
- Macedon Ranges Shire
- Mansfield Shire
- Maribyrnong City
- Maroondah City
- Melton City
- Mildura Rural City
- Moorabool Shire
- Mornington Peninsula Shire
- Mount Alexander Shire
- Moyne Shire
- Nillumbik Shire
- Pyrenees Shire
- Stonnington City
- Surf Coast Shire
- Swan Hill Rural City
- Wangaratta Rural City
- Yarra Ranges Shire

More councils are being added regularly!

## Tech Stack

- **Frontend**: React Native 0.79.5 with Expo SDK 53
- **Navigation**: Expo Router v5 (file-based routing)
- **Backend**: Convex 1.25.2 (serverless functions)
- **Language**: TypeScript 5.8.3 (strict mode)
- **State Management**: Zustand 5.0.2
- **Animations**: React Native Reanimated 3.17.4
- **Date Handling**: Luxon 3.7.1
- **Styling**: React Native StyleSheet with theme support
- **Code Quality**: ESLint + Biome
- **External APIs**: Google Places API, Council waste APIs

## Getting Started

### Prerequisites

- Node.js 18+ and [Bun](https://bun.sh) installed
- Expo CLI (`bun add -g expo`)
- iOS Simulator (Mac only) or Android Emulator
- Convex account for backend services
- Google Cloud account with Places API enabled

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bin-day.git
   cd bin-day
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   Create a `.env.local` file with:

   ```env
   EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

4. Set up Convex environment variables:

   In your Convex dashboard, add:

   - `GOOGLE_PLACES_API_KEY` - Your Google Places API key

5. Start the development server:

   ```bash
   bun run start
   ```

### Running the App

After starting the development server, you can:

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Press `w` to open in web browser
- Scan the QR code with Expo Go app on your physical device

## Development

### Project Structure

```text
bin-day/
├── app/                    # Expo Router screens and layouts
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Main home screen
│   └── +not-found.tsx      # 404 screen
├── components/             # Reusable React components
│   ├── address/            # Address display components
│   ├── common/             # Common UI components
│   ├── search/             # Search-related components
│   ├── ui/                 # Platform-specific UI components
│   └── waste/              # Waste collection components
├── convex/                 # Backend functions
│   ├── councils/           # Council implementations
│   │   ├── core/           # Shared utilities and types
│   │   └── implementations/ # Individual council APIs
│   ├── councilServices.ts  # Main orchestrator
│   └── googlePlaces.ts     # Google Places integration
├── constants/              # App constants and theme colors
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── stores/                 # Zustand state management
├── types/                  # TypeScript type definitions
├── utils/                  # Helper functions
└── CLAUDE.md               # AI assistant instructions
```

### Available Scripts

```bash
bun run start          # Start Expo dev server
bun run android        # Run on Android
bun run ios           # Run on iOS
bun run web           # Run in browser
bun run lint          # Run ESLint
bun run check:fix     # Format and lint with Biome
bun run check-types   # TypeScript type checking
bun run build:simulator:ios # Build for iOS simulator
```

### Code Quality

The project uses:

- **ESLint** with Expo config for linting
- **Biome** for formatting (tab indentation, double quotes)
- **TypeScript** in strict mode with path aliases
- **GitHub Actions** for automated PR reviews with Claude
- **Pre-configured VSCode** settings for optimal development

### Architecture Highlights

- **State Management**: Zustand with separate slices for search, address, and council data
- **Animation System**: Unified animation management with consistent bezier curves
- **Error Handling**: Standardized error classes and user-friendly error messages
- **Performance**: Optimized FlatList rendering, debounced search, and proper memoization
- **Type Safety**: Strict TypeScript with generated Convex types
- **Platform-Specific**: Separate implementations for iOS/Android where needed

### Adding a New Council

1. Check if the council uses the standard API pattern or needs custom implementation
2. Create a new file in `convex/councils/implementations/[councilName].ts`
3. For standard pattern:

   ```typescript
   export async function fetchCouncilData(placeDetails: GooglePlaceDetails) {
     return processCouncilData(placeDetails, COUNCIL_NAMES.COUNCIL_NAME, {
       searchApiUrl: "https://council.vic.gov.au/api/v1/myarea/search",
       wasteServicesUrl:
         "https://council.vic.gov.au/ocapi/Public/myarea/wasteservices",
       wasteTypePatterns: {
         landfillWaste: /pattern/,
         recycling: /pattern/,
         // ... other patterns
       },
     });
   }
   ```

4. Add the council name to `COUNCIL_NAMES` in `convex/councils/core/types.ts`
5. Register the handler in `convex/councilServices.ts`
6. Update the Convex schema with the new council literal
7. Test with real addresses from the council area
8. Update this README with the new council

## API Response Format

All councils return waste collection data in this standardized format:

```typescript
{
  landfillWaste: number | null; // Unix timestamp
  recycling: number | null; // Unix timestamp
  foodAndGardenWaste: number | null; // Unix timestamp
  hardWaste: number | null; // Unix timestamp
  glass: number | null; // Unix timestamp
}
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch following the naming convention:
   - `feat/` for new features
   - `fix/` for bug fixes
   - `chore/` for maintenance
   - `docs/` for documentation
3. Ensure all checks pass (type checking, linting, formatting)
4. Commit your changes with clear messages
5. Push to your branch and open a Pull Request

### Development Guidelines

- Use the `@/*` import alias for all internal imports
- Follow existing component patterns with React.memo for performance
- Add proper TypeScript types for all props and state
- Include accessibility props (labels, hints) on interactive elements
- Test on both iOS and Android platforms
- Ensure animations are smooth and properly cleaned up

## Environment Variables

### Client-side (Expo)

- `EXPO_PUBLIC_CONVEX_URL` - Your Convex deployment URL

### Server-side (Convex)

- `GOOGLE_PLACES_API_KEY` - Google Places API key with Places API enabled

## Troubleshooting

### Common Issues

1. **Address not found**: Ensure the address is within Victoria, Australia
2. **Council not supported**: Check the supported councils list above
3. **No collection dates**: Some councils may not provide all waste types
4. **API errors**: Check your Google Places API key and quotas

### Debug Mode

To enable detailed logging, you can use the Expo development menu and enable "Debug Remote JS" for Chrome DevTools debugging.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Convex](https://convex.dev)
- Address search by [Google Places API](https://developers.google.com/maps/documentation/places)
- Council data from respective Victorian council APIs
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Animations by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- Date handling by [Luxon](https://moment.github.io/luxon/)

## Contact

For questions, bug reports, or feature requests, please open an issue on GitHub.
