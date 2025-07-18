import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function useAnimations() {
	// Animation values
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const emptyStateFadeAnim = useRef(new Animated.Value(1)).current;
	const resultsOpacityAnim = useRef(new Animated.Value(0)).current;
	const resultsScaleAnim = useRef(new Animated.Value(0.95)).current;
	const inputFocusAnim = useRef(new Animated.Value(0)).current;

	// Start animations
	const animateSearchFocus = (focused: boolean) => {
		Animated.timing(inputFocusAnim, {
			toValue: focused ? 1 : 0,
			duration: 200,
			useNativeDriver: true,
		}).start();
	};

	const animateResults = (show: boolean) => {
		if (show) {
			Animated.parallel([
				Animated.timing(resultsOpacityAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
					easing: Easing.out(Easing.cubic),
				}),
				Animated.timing(resultsScaleAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
					easing: Easing.out(Easing.cubic),
				}),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(resultsOpacityAnim, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
					easing: Easing.in(Easing.cubic),
				}),
				Animated.timing(resultsScaleAnim, {
					toValue: 0.95,
					duration: 150,
					useNativeDriver: true,
					easing: Easing.in(Easing.cubic),
				}),
			]).start();
		}
	};

	const animateEmptyState = (show: boolean) => {
		Animated.timing(emptyStateFadeAnim, {
			toValue: show ? 1 : 0.3,
			duration: 200,
			useNativeDriver: true,
		}).start();
	};

	const animateFadeIn = () => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	};

	// Cleanup animations on unmount
	// biome-ignore lint/correctness/useExhaustiveDependencies: Animation refs are stable
	useEffect(() => {
		return () => {
			// Stop all animations
			fadeAnim.stopAnimation();
			emptyStateFadeAnim.stopAnimation();
			resultsOpacityAnim.stopAnimation();
			resultsScaleAnim.stopAnimation();
			inputFocusAnim.stopAnimation();

			// Remove all listeners
			fadeAnim.removeAllListeners();
			emptyStateFadeAnim.removeAllListeners();
			resultsOpacityAnim.removeAllListeners();
			resultsScaleAnim.removeAllListeners();
			inputFocusAnim.removeAllListeners();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
