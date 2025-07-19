import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
	useComponentAnimation,
	usePressAnimation,
} from "@/hooks/useAnimations";
import { useThemeColor } from "@/hooks/useThemeColor";
import { extractAddressComponents } from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";

interface AddressDisplayProps {
	selectedAddress: string | null;
	selectedPlaceDetails: GooglePlaceDetails | null;
	selectedCouncil: string | null;
	onClear: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Spacing system constants
const SPACING = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
} as const;

export function AddressDisplay({
	selectedAddress,
	selectedPlaceDetails,
	selectedCouncil,
	onClear,
}: AddressDisplayProps) {
	// Theme colors
	const textColor = useThemeColor({}, "text");
	const tintColor = useThemeColor({}, "tint");
	const backgroundColor = useThemeColor({}, "background");
	const isDarkMode = backgroundColor === "#151718";

	// Modern card design with proper separation
	const cardBgColor = useThemeColor(
		{ light: "rgba(249, 250, 251, 0.8)", dark: "rgba(28, 28, 30, 0.95)" },
		"background",
	);
	const borderColor = useThemeColor(
		{ light: "rgba(0, 0, 0, 0.12)", dark: "rgba(255, 255, 255, 0.15)" },
		"text",
	);
	const clearButtonBg = useThemeColor(
		{ light: "rgba(0, 0, 0, 0.08)", dark: "rgba(255, 255, 255, 0.12)" },
		"background",
	);
	const iconBgColor = useThemeColor(
		{ light: `${tintColor}10`, dark: `${tintColor}15` },
		"tint",
	);
	const secondaryTextColor = useThemeColor(
		{ light: "rgba(17, 24, 28, 0.6)", dark: "rgba(236, 237, 238, 0.6)" },
		"text",
	);

	// Animation hooks
	const { scaleAnim, opacityAnim, animateIn, animateOut } =
		useComponentAnimation();
	const {
		scaleAnim: clearButtonScale,
		opacityAnim: clearButtonOpacity,
		handlePressIn: handleClearPressIn,
		handlePressOut: handleClearPressOut,
	} = usePressAnimation(1);

	// Entry animation
	useEffect(() => {
		animateIn();
	}, [animateIn]);

	// Container animated style with enhanced spring physics
	const containerAnimatedStyle = useAnimatedStyle(() => {
		const scale = withSpring(scaleAnim.value, {
			damping: 14,
			stiffness: 120,
			mass: 0.8,
		});
		return {
			transform: [{ scale }],
			opacity: opacityAnim.value,
		};
	});

	// Clear button animated style with rotation on press
	const clearButtonAnimatedStyle = useAnimatedStyle(() => {
		const scale = withSpring(clearButtonScale.value, {
			damping: 15,
			stiffness: 300,
		});
		const rotation = interpolate(
			clearButtonScale.value,
			[1, 0.9],
			[0, -90],
			Extrapolation.CLAMP,
		);
		return {
			transform: [{ scale }, { rotate: `${rotation}deg` }],
			opacity: clearButtonOpacity.value || 1,
		};
	});

	// Icon container animated style with subtle bounce
	const iconContainerAnimatedStyle = useAnimatedStyle(() => {
		const scale = withSequence(
			withTiming(1, { duration: 0 }),
			withSpring(1.05, { damping: 10, stiffness: 100 }),
			withSpring(1, { damping: 10, stiffness: 100 }),
		);
		return scaleAnim.value > 0.5 ? { transform: [{ scale }] } : {};
	});

	// Handle clear button interactions
	const handlePressIn = () => {
		handleClearPressIn();
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	};

	const handlePressOut = () => {
		handleClearPressOut();
	};

	const handleClear = () => {
		// Exit animation before clearing
		animateOut(onClear);
	};

	if (!selectedAddress) {
		return null;
	}

	// Extract address components
	let line1 = "";
	let line2 = "";
	let locality = "";

	if (selectedPlaceDetails) {
		const components = extractAddressComponents(selectedPlaceDetails);
		const streetAddress = components.subpremise
			? `${components.subpremise}/${components.streetNumber} ${components.route}`
			: `${components.streetNumber} ${components.route}`;
		line1 = streetAddress.trim() || components.route;
		line2 =
			`${components.locality} ${components.administrativeAreaLevel1} ${components.postalCode}`.trim();
		locality = components.locality;
	} else {
		line1 = selectedAddress;
	}

	// Card content component
	const CardContent = () => (
		<View style={styles.mainContent}>
			<Animated.View
				style={[
					styles.iconContainer,
					{ backgroundColor: iconBgColor },
					iconContainerAnimatedStyle,
				]}
			>
				<IconSymbol name="location" size={20} color={tintColor} />
			</Animated.View>
			<View style={styles.contentContainer}>
				<View style={styles.addressContainer}>
					<ThemedText style={[styles.addressLine1, { color: textColor }]}>
						{line1}
					</ThemedText>
					{line2 && (
						<ThemedText
							style={[styles.addressLine2, { color: secondaryTextColor }]}
						>
							{line2}
						</ThemedText>
					)}
				</View>
				{selectedCouncil && (
					<View
						style={[
							styles.councilBadge,
							{
								backgroundColor: isDarkMode
									? `${tintColor}20`
									: `${tintColor}12`,
								borderColor: isDarkMode ? `${tintColor}30` : `${tintColor}20`,
							},
						]}
					>
						<ThemedText style={[styles.councilBadgeText, { color: tintColor }]}>
							{selectedCouncil}
						</ThemedText>
					</View>
				)}
			</View>
			<AnimatedPressable
				onPress={handleClear}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={[
					styles.clearButton,
					{ backgroundColor: clearButtonBg },
					clearButtonAnimatedStyle,
				]}
				accessible={true}
				accessibilityRole="button"
				accessibilityLabel="Remove selected address"
				accessibilityHint={`Currently showing ${line1}${locality ? `, ${locality}` : ""}. Double tap to search for a new address.`}
			>
				<IconSymbol name="xmark" size={18} color={textColor} />
			</AnimatedPressable>
		</View>
	);

	return (
		<Animated.View style={[styles.container, containerAnimatedStyle]}>
			{Platform.OS === "ios" ? (
				<BlurView
					style={[
						styles.card,
						{
							borderColor,
						},
					]}
					intensity={isDarkMode ? 25 : 45}
					tint={isDarkMode ? "dark" : "light"}
				>
					<CardContent />
				</BlurView>
			) : (
				<View
					style={[
						styles.card,
						{
							backgroundColor: cardBgColor,
							borderColor,
						},
					]}
				>
					<CardContent />
				</View>
			)}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING.lg,
	},
	card: {
		padding: SPACING.md + 2,
		borderRadius: 24,
		borderWidth: 1,
		overflow: "hidden",
	},
	mainContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	iconContainer: {
		width: 44,
		height: 44,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.md,
	},
	contentContainer: {
		flex: 1,
		paddingRight: SPACING.sm,
	},
	addressContainer: {
		gap: 2,
	},
	addressLine1: {
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: -0.3,
		lineHeight: 22,
	},
	addressLine2: {
		fontSize: 14,
		fontWeight: "500",
		lineHeight: 18,
	},
	councilBadge: {
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 10,
		marginTop: SPACING.sm,
		alignSelf: "flex-start",
		borderWidth: 1,
	},
	councilBadgeText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	clearButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: SPACING.sm,
	},
});
