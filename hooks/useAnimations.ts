import { useEffect } from "react";
import {
	cancelAnimation,
	Easing,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

export function useAnimations() {
	// Reanimated shared values
	const fadeAnim = useSharedValue(0);
	const emptyStateFadeAnim = useSharedValue(1);
	const resultsOpacityAnim = useSharedValue(0);
	const resultsScaleAnim = useSharedValue(0.95);
	const inputFocusAnim = useSharedValue(0);

	// Start animations
	const animateSearchFocus = (focused: boolean) => {
		inputFocusAnim.value = withTiming(focused ? 1 : 0, {
			duration: 350,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	};

	const animateResults = (show: boolean) => {
		if (show) {
			resultsOpacityAnim.value = withTiming(1, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
			resultsScaleAnim.value = withTiming(1, {
				duration: 300,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
		} else {
			resultsOpacityAnim.value = withTiming(0, {
				duration: 250,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
			resultsScaleAnim.value = withTiming(0.95, {
				duration: 250,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			});
		}
	};

	const animateEmptyState = (show: boolean) => {
		emptyStateFadeAnim.value = withTiming(show ? 1 : 0.3, {
			duration: 350,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	};

	const animateFadeIn = () => {
		fadeAnim.value = withTiming(1, {
			duration: 350,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});
	};

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
	};
}
