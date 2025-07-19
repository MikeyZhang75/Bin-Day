import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"background",
	);
	const borderColor = useThemeColor(
		{ light: "transparent", dark: "rgba(255,255,255,0.06)" },
		"text",
	);
	const clearButtonBg = useThemeColor(
		{ light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.1)" },
		"background",
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

	// Container animated style
	const containerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scaleAnim.value }],
		opacity: opacityAnim.value,
	}));

	// Clear button animated style
	const clearButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: clearButtonScale.value }],
		opacity: clearButtonOpacity.value || 0.7,
	}));

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

	return (
		<Animated.View style={[styles.container, containerAnimatedStyle]}>
			<ThemedView
				style={[
					styles.card,
					{
						backgroundColor: cardBgColor,
						borderColor,
						...Platform.select({
							ios: {
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.06,
								shadowRadius: 12,
							},
							android: {
								elevation: 3,
							},
						}),
					},
				]}
			>
				<View style={styles.contentContainer}>
					<View style={styles.addressContainer}>
						<ThemedText style={styles.addressLine1}>{line1}</ThemedText>
						{line2 && (
							<ThemedText style={[styles.addressLine2, { color: textColor }]}>
								{line2}
							</ThemedText>
						)}
					</View>
					{selectedCouncil && (
						<View
							style={[
								styles.councilBadge,
								{ backgroundColor: `${tintColor}15` },
							]}
						>
							<ThemedText
								style={[styles.councilBadgeText, { color: tintColor }]}
							>
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
					<IconSymbol name="xmark" size={16} color={textColor} />
				</AnimatedPressable>
			</ThemedView>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: SPACING.md,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: SPACING.md,
		borderRadius: 20,
		borderWidth: 1,
	},
	contentContainer: {
		flex: 1,
		paddingRight: SPACING.sm,
	},
	addressContainer: {
		gap: SPACING.xs,
	},
	addressLine1: {
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: -0.5,
		lineHeight: 24,
	},
	addressLine2: {
		fontSize: 15,
		fontWeight: "500",
		opacity: 0.7,
		lineHeight: 20,
	},
	councilBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		marginTop: SPACING.sm,
		alignSelf: "flex-start",
	},
	councilBadgeText: {
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: 0.2,
	},
	clearButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: SPACING.sm,
	},
});
