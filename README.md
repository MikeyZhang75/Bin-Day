# Bin Day 🗑️

A React Native app that helps Australian residents find waste collection information for their addresses. Simply search for your address and get up-to-date bin collection dates for landfill, recycling, food & garden waste, and hard waste services.

## Features

- 🔍 **Address Search**: Search for any Australian address using Google Places Autocomplete
- 📅 **Collection Dates**: View upcoming collection dates for all waste types
- 🏛️ **Council Support**: Currently supports multiple Victorian councils
- 📱 **Cross-Platform**: Works on iOS, Android, and web browsers
- 🌓 **Dark Mode**: Automatic theme switching based on device preferences

## Supported Councils

Currently supporting the following councils:

- City of Monash
- Alpine Shire
- City of Ballarat
- Banyule City
- Gannawarra Shire

More councils coming soon!

## Tech Stack

- **Frontend**: React Native with Expo SDK 53
- **Navigation**: Expo Router v5 (file-based routing)
- **Backend**: Convex (serverless functions)
- **Language**: TypeScript
- **Styling**: React Native StyleSheet with theme support
- **External APIs**: Google Places API, Council waste APIs

## Getting Started

### Prerequisites

- Node.js 18+ and Bun installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Convex account for backend services

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

   - Copy `.env.example` to `.env.local`
   - Add your Google Places API key and other required variables

4. Set up Convex:

   ```bash
   bunx convex dev
   ```

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

```
bin-day/
├── app/                    # Expo Router screens and layouts
│   ├── (tabs)/             # Tab navigation screens
│   ├── _layout.tsx         # Root layout
│   └── +not-found.tsx      # 404 screen
├── components/             # Reusable React components
│   └── ui/                 # Platform-specific UI components
├── convex/                 # Backend functions
│   ├── councils/           # Council-specific implementations
│   └── _generated/         # Auto-generated Convex types
├── constants/              # App constants and theme colors
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
└── .claude/               # AI assistant configuration
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
```

### Code Quality

The project uses:

- **ESLint** with Expo config for linting
- **Biome** for formatting (tab indentation, double quotes)
- **TypeScript** in strict mode
- **Pre-commit hooks** for automated checks

### Adding a New Council

1. Create a new file in `convex/councils/councilName.ts`
2. Implement the `fetch[CouncilName]Data` function following the existing pattern
3. Add the council handler to `convex/councilServices.ts`
4. Update the supported councils list in documentation

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Convex](https://convex.dev)
- Address search by [Google Places API](https://developers.google.com/maps/documentation/places)
- Council data from respective council APIs
