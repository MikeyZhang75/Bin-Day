# Animation System Documentation

## Overview

The Bin Day app uses a unified animation system built on React Native Reanimated 3 that provides smooth, consistent transitions throughout the user interface. All animations use the same timing curves and easing functions for a cohesive user experience.

## Recent Updates

### Version 2.0 - Unified Animation System

- **Smooth Transitions**: All animations now use consistent bezier curves to eliminate flashing effects
- **Increased Durations**: Extended animation timing for more natural feel
- **Reduced Blur**: Subtler blur effects for better content visibility
- **Conditional Rendering**: Search input hides when address is selected

## Animation Configuration

### Core Animation Settings

All animations use the following standardized configuration:

```typescript
const ANIMATION_CONFIG = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};
```

### Bezier Curve Breakdown

- **Control Points**: `(0.25, 0.1, 0.25, 1)`
- **Characteristics**: Smooth ease-in-out with gentle deceleration
- **Benefits**: Eliminates harsh endings and flashing effects

## Animation Types

### 1. Search Input Focus Animation

**Duration**: 350ms  
**Easing**: Bezier curve  
**Elements**: Border color and search icon transitions

```typescript
const animateSearchFocus = (focused: boolean) => {
  inputFocusAnim.value = withTiming(focused ? 1 : 0, {
    duration: 350,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
};
```

### 2. Search Results Dropdown

**Show Duration**: 300ms  
**Hide Duration**: 250ms  
**Easing**: Bezier curve  
**Elements**: Opacity and scale transitions

```typescript
const animateResults = (show: boolean) => {
  if (show) {
    resultsOpacityAnim.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  } else {
    resultsOpacityAnim.value = withTiming(0, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }
};
```

### 3. Blur Overlay Animation

**Show Duration**: 300ms  
**Hide Duration**: 250ms (with dropdown) / 300ms (without)  
**Easing**: Bezier curve  
**Elements**: Background blur opacity

```typescript
const animateBlur = (show: boolean, hasDropdown = false) => {
  if (show) {
    blurOpacityAnim.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  } else {
    const duration = hasDropdown ? 300 : 250;
    blurOpacityAnim.value = withTiming(0, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }
};
```

### 4. Empty State Animation

**Duration**: 350ms  
**Easing**: Bezier curve  
**Elements**: Fade between full and reduced opacity

### 5. Selected Content Fade-in

**Duration**: 350ms  
**Easing**: Bezier curve  
**Elements**: Address display and waste collection grid

## Blur Effect Configuration

### iOS BlurView

```typescript
<BlurView
  intensity={12}
  tint={colorScheme}
  style={StyleSheet.absoluteFillObject}
/>
```

### Android Fallback

```typescript
<View style={{
  backgroundColor: "rgba(0,0,0,0.06)"
}} />
```

**Intensity**: Reduced from 20 to 12 for subtler effect  
**Android Opacity**: Reduced from 0.1 to 0.06 for consistency

## UI Improvements

### Search Input Conditional Rendering

The search input is now hidden when an address is selected to provide a cleaner interface:

```typescript
{!selectedAddress && (
  <View style={styles.searchWrapper}>
    <SearchBar {...props} />
  </View>
)}
```

### Header Removal

Removed the app title and subtitle to maximize screen space for content:

- Eliminated "🗑️ Bin Day" title
- Removed "Find your waste collection dates" subtitle
- Adjusted content padding to maintain proper spacing

### Border Color Animation

Search input border now uses smooth color interpolation:

```typescript
const animatedContainerStyle = useAnimatedStyle(() => {
  const progress = inputFocusAnim?.value || 0;
  const borderColor = interpolateColor(
    progress,
    [0, 1],
    [`${textColor}20`, tintColor]
  );
  return { borderColor };
});
```

## Performance Considerations

### Optimization Strategies

1. **Shared Values**: Using Reanimated shared values for optimal performance
2. **Worklet Functions**: Animations run on the UI thread
3. **Consistent Timing**: Unified timing reduces animation complexity
4. **Graceful Degradation**: Android fallbacks for iOS-specific effects

### Memory Management

- Automatic cleanup handled by Reanimated 3
- No manual animation cleanup required
- Efficient opacity transitions over color animations

## Usage Guidelines

### Adding New Animations

When adding new animations, use the standardized configuration:

```typescript
const newAnimation = useSharedValue(0);

const animateNewFeature = (show: boolean) => {
  newAnimation.value = withTiming(show ? 1 : 0, {
    duration: 350,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
};
```

### Timing Variations

- **Standard**: 350ms for main transitions
- **Quick**: 250-300ms for secondary elements
- **Slow**: 400ms+ for complex state changes

### Best Practices

1. Always use the standard bezier curve for consistency
2. Test animations on both iOS and Android
3. Consider reducing timing for frequently triggered animations
4. Maintain synchronization between related animations

## Troubleshooting

### Common Issues

1. **Flashing Effects**: Ensure proper easing curves are used
2. **Jerky Animations**: Check for consistent timing across related elements
3. **Performance Issues**: Verify animations are running on UI thread

### Debug Tips

1. Use Flipper to monitor animation performance
2. Test on lower-end devices for performance validation
3. Verify blur effects work correctly across platforms
