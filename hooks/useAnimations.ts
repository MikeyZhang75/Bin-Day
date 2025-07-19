import { useCallback, useEffect } from "react";
import {
	cancelAnimation,
	Easing,
	runOnJS,
	useSharedValue,
	withDelay,
	withRepeat,
	withSpring,
	withTiming,
} from "react-native-reanimated";

// Common animation configuration
export const ANIMATION_CONFIG = {
	duration: 350,
	easing: Easing.bezier(0.25, 0.1, 0.25, 1),
	spring: {
		damping: 18,
		stiffness: 200,
	},
	pressSpring: {
		damping: 15,
		stiffness: 400,
	},
} as const;

export function useAnimations() {
	// Reanimated shared values
	const fadeAnim = useSharedValue(0);
	const emptyStateFadeAnim = useSharedValue(1);
	const resultsOpacityAnim = useSharedValue(0);
	const resultsScaleAnim = useSharedValue(0.95);
	const inputFocusAnim = useSharedValue(0);

	// Start animations
	const animateSearchFocus = useCallback(
		(focused: boolean) => {
			inputFocusAnim.value = withTiming(focused ? 1 : 0, {
				duration: ANIMATION_CONFIG.duration,
				easing: ANIMATION_CONFIG.easing,
			});
		},
		[inputFocusAnim],
	);

	const animateResults = useCallback(
		(show: boolean) => {
			if (show) {
				resultsOpacityAnim.value = withTiming(1, {
					duration: 300,
					easing: ANIMATION_CONFIG.easing,
				});
				resultsScaleAnim.value = withTiming(1, {
					duration: 300,
					easing: ANIMATION_CONFIG.easing,
				});
			} else {
				resultsOpacityAnim.value = withTiming(0, {
					duration: 250,
					easing: ANIMATION_CONFIG.easing,
				});
				resultsScaleAnim.value = withTiming(0.95, {
					duration: 250,
					easing: ANIMATION_CONFIG.easing,
				});
			}
		},
		[resultsOpacityAnim, resultsScaleAnim],
	);

	const animateEmptyState = useCallback(
		(show: boolean) => {
			console.log(
				"[animateEmptyState] Called with show:",
				show,
				"Setting opacity to:",
				show ? 1 : 0.3,
			);
			emptyStateFadeAnim.value = withTiming(show ? 1 : 0.3, {
				duration: ANIMATION_CONFIG.duration,
				easing: ANIMATION_CONFIG.easing,
			});
		},
		[emptyStateFadeAnim],
	);

	const animateFadeIn = useCallback(() => {
		console.log("[animateFadeIn] Setting fadeAnim to 1");
		fadeAnim.value = withTiming(1, {
			duration: ANIMATION_CONFIG.duration,
			easing: ANIMATION_CONFIG.easing,
		});
	}, [fadeAnim]);

	const animateFadeOut = useCallback(() => {
		console.log("[animateFadeOut] Setting fadeAnim to 0");
		fadeAnim.value = withTiming(0, {
			duration: ANIMATION_CONFIG.duration,
			easing: ANIMATION_CONFIG.easing,
		});
	}, [fadeAnim]);

	// Cleanup is handled automatically by Reanimated, but for complex scenarios
	// we can manually cancel animations on unmount
	useEffect(() => {
		return () => {
			// Cancel all running animations on unmount to prevent memory leaks
			// This is especially important for complex animation chains
			cancelAnimation(fadeAnim);
			cancelAnimation(emptyStateFadeAnim);
			cancelAnimation(resultsOpacityAnim);
			cancelAnimation(resultsScaleAnim);
			cancelAnimation(inputFocusAnim);
		};
	}, [
		fadeAnim,
		emptyStateFadeAnim,
		resultsOpacityAnim,
		resultsScaleAnim,
		inputFocusAnim,
	]);

	return {
		// Animation values
		fadeAnim,
		emptyStateFadeAnim,
		resultsOpacityAnim,
		resultsScaleAnim,
		inputFocusAnim,
		// Animation functions
		animateSearchFocus,
		animateResults,
		animateEmptyState,
		animateFadeIn,
		animateFadeOut,
	};
}

// Hook for component entry/exit animations
export function useComponentAnimation(initialScale = 0.95) {
	const scaleAnim = useSharedValue(initialScale);
	const opacityAnim = useSharedValue(0);

	const animateIn = useCallback(() => {
		scaleAnim.value = withSpring(1, ANIMATION_CONFIG.spring);
		opacityAnim.value = withTiming(1, {
			duration: ANIMATION_CONFIG.duration,
			easing: ANIMATION_CONFIG.easing,
		});
	}, [scaleAnim, opacityAnim]);

	const animateOut = useCallback(
		(onComplete?: () => void) => {
			scaleAnim.value = withTiming(initialScale, { duration: 200 });
			opacityAnim.value = withTiming(0, { duration: 200 }, () => {
				"worklet";
				if (onComplete) {
					runOnJS(onComplete)();
				}
			});
		},
		[scaleAnim, opacityAnim, initialScale],
	);

	useEffect(() => {
		return () => {
			cancelAnimation(scaleAnim);
			cancelAnimation(opacityAnim);
		};
	}, [scaleAnim, opacityAnim]);

	return {
		scaleAnim,
		opacityAnim,
		animateIn,
		animateOut,
	};
}

// Hook for press animations
export function usePressAnimation(initialScale = 1) {
	const scaleAnim = useSharedValue(initialScale);
	const opacityAnim = useSharedValue(1);

	const handlePressIn = useCallback(() => {
		scaleAnim.value = withSpring(0.95, ANIMATION_CONFIG.pressSpring);
	}, [scaleAnim]);

	const handlePressOut = useCallback(() => {
		scaleAnim.value = withSpring(initialScale, ANIMATION_CONFIG.pressSpring);
	}, [scaleAnim, initialScale]);

	useEffect(() => {
		return () => {
			cancelAnimation(scaleAnim);
			cancelAnimation(opacityAnim);
		};
	}, [scaleAnim, opacityAnim]);

	return {
		scaleAnim,
		opacityAnim,
		handlePressIn,
		handlePressOut,
	};
}

// Hook for shimmer loading effect
export function useShimmerAnimation(delay = 0) {
	const shimmerAnim = useSharedValue(0);

	const startShimmer = useCallback(() => {
		shimmerAnim.value = withDelay(
			delay,
			withRepeat(
				withTiming(1, {
					duration: 1500,
					easing: Easing.linear,
				}),
				-1,
			),
		);
	}, [shimmerAnim, delay]);

	const stopShimmer = useCallback(() => {
		cancelAnimation(shimmerAnim);
		shimmerAnim.value = 0;
	}, [shimmerAnim]);

	useEffect(() => {
		return () => {
			cancelAnimation(shimmerAnim);
		};
	}, [shimmerAnim]);

	return {
		shimmerAnim,
		startShimmer,
		stopShimmer,
	};
}
