import { useState } from "react";
import {
	Easing,
	runOnJS,
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
	const blurOpacityAnim = useSharedValue(0);

	// State to track if blur should be rendered
	const [shouldRenderBlur, setShouldRenderBlur] = useState(false);

	// Start animations
	const animateSearchFocus = (focused: boolean) => {
		inputFocusAnim.value = withTiming(focused ? 1 : 0, {
			duration: 200,
			easing: Easing.out(Easing.cubic),
		});
	};

	// Animate blur overlay with proper exit animation
	const animateBlur = (show: boolean, hasDropdown = false) => {
		if (show) {
			setShouldRenderBlur(true);
			blurOpacityAnim.value = withTiming(1, {
				duration: 150,
				easing: Easing.out(Easing.cubic),
			});
		} else {
			// Sync with dropdown close animation if dropdown is visible
			const duration = hasDropdown ? 150 : 120;
			blurOpacityAnim.value = withTiming(
				0,
				{
					duration,
					easing: Easing.in(Easing.cubic),
				},
				(finished) => {
					if (finished) {
						runOnJS(setShouldRenderBlur)(false);
					}
				},
			);
		}
	};

	const animateResults = (show: boolean) => {
		if (show) {
			resultsOpacityAnim.value = withTiming(1, {
				duration: 200,
				easing: Easing.out(Easing.cubic),
			});
			resultsScaleAnim.value = withTiming(1, {
				duration: 200,
				easing: Easing.out(Easing.cubic),
			});
		} else {
			resultsOpacityAnim.value = withTiming(0, {
				duration: 150,
				easing: Easing.in(Easing.cubic),
			});
			resultsScaleAnim.value = withTiming(0.95, {
				duration: 150,
				easing: Easing.in(Easing.cubic),
			});
		}
	};

	const animateEmptyState = (show: boolean) => {
		emptyStateFadeAnim.value = withTiming(show ? 1 : 0.3, {
			duration: 200,
		});
	};

	const animateFadeIn = () => {
		fadeAnim.value = withTiming(1, {
			duration: 300,
		});
	};

	// Cleanup is handled automatically by Reanimated

	return {
		// Animation values
		fadeAnim,
		emptyStateFadeAnim,
		resultsOpacityAnim,
		resultsScaleAnim,
		inputFocusAnim,
		blurOpacityAnim,
		shouldRenderBlur,
		// Animation functions
		animateSearchFocus,
		animateResults,
		animateEmptyState,
		animateFadeIn,
		animateBlur,
	};
}
