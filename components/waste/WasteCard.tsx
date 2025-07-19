import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface WasteType {
	key: string;
	name: string;
	icon: "trash" | "arrow.3.trianglepath" | "leaf" | "shippingbox" | "wineglass";
	color: string;
	bgColor: string;
}

interface WasteCardProps {
	type: WasteType;
	formattedDate: string;
	priority?: "today" | "upcoming" | "future";
	animationDelay?: number;
	onPress?: () => void;
}

// Spacing system constants
const SPACING = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
} as const;

// Animation constants
const ANIMATION_CONFIG = {
	duration: 350,
	easing: Easing.bezier(0.25, 0.1, 0.25, 1),
	spring: {
		damping: 18,
		stiffness: 200,
	},
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const WasteCard = React.memo(
	({
		type,
		formattedDate,
		priority = "upcoming",
		animationDelay = 0,
		onPress,
	}: WasteCardProps) => {
		// Theme colors
		const textColor = useThemeColor({}, "text");
		const cardBgColor = useThemeColor(
			{ light: "#FFFFFF", dark: "#1C1C1E" },
			"background",
		);
		const borderColor = useThemeColor(
			{ light: "#E5E5E7", dark: "#2C2C2E" },
			"text",
		);

		const isToday = formattedDate === "Today";
		const isTomorrow = formattedDate === "Tomorrow";

		// Get priority-based initial scale
		const initialScale =
			priority === "today" ? 1.05 : priority === "future" ? 0.95 : 1;

		// Animation values
		const scaleAnim = useSharedValue(1);
		const opacityAnim = useSharedValue(priority === "future" ? 0.85 : 1);

		// Animation styles - keep transform animations separate from layout animations
		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scaleAnim.value }],
			opacity: opacityAnim.value,
		}));

		// Initial scale style - separate from interactive animations
		const initialScaleStyle = useAnimatedStyle(() => ({
			transform: [{ scale: initialScale }],
		}));

		// Handle press interactions
		const handlePressIn = () => {
			scaleAnim.value = withSpring(0.95, {
				damping: 15,
				stiffness: 400,
			});
			if (Platform.OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
		};

		const handlePressOut = () => {
			scaleAnim.value = withSpring(1, {
				damping: 15,
				stiffness: 400,
			});
		};

		const getShadowStyle = () => {
			switch (priority) {
				case "today":
					return Platform.select({
						ios: {
							shadowColor: type.color,
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.2,
							shadowRadius: 12,
						},
						android: { elevation: 8 },
					});
				case "upcoming":
					return Platform.select({
						ios: {
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.08,
							shadowRadius: 8,
						},
						android: { elevation: 4 },
					});
				default:
					return Platform.select({
						ios: {
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.05,
							shadowRadius: 4,
						},
						android: { elevation: 2 },
					});
			}
		};

		return (
			<Animated.View
				entering={FadeInDown.duration(ANIMATION_CONFIG.duration)
					.delay(animationDelay)
					.easing(ANIMATION_CONFIG.easing)
					.springify()
					.damping(ANIMATION_CONFIG.spring.damping)
					.stiffness(ANIMATION_CONFIG.spring.stiffness)}
				style={styles.wasteCardWrapper}
			>
				<AnimatedPressable
					style={[
						styles.wasteCard,
						{
							backgroundColor: isToday ? `${type.color}12` : cardBgColor,
							borderColor: isToday || isTomorrow ? type.color : borderColor,
							borderWidth: isToday ? 2 : 1,
						},
						getShadowStyle(),
						initialScaleStyle,
						animatedStyle,
					]}
					onPress={onPress}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					disabled={!onPress}
					accessible={true}
					accessibilityRole="button"
					accessibilityLabel={`${type.name} collection: ${formattedDate}`}
					accessibilityHint={
						isToday
							? "Collection is today. Double tap for details."
							: isTomorrow
								? "Collection is tomorrow. Double tap for details."
								: `Collection on ${formattedDate}. Double tap for details.`
					}
				>
					<Animated.View
						style={[
							styles.wasteIconContainer,
							{
								backgroundColor: isToday ? type.color : type.bgColor,
							},
							priority === "today" && styles.todayIconContainer,
						]}
					>
						<IconSymbol
							name={type.icon}
							size={priority === "today" ? 20 : 18}
							color={isToday ? "#FFFFFF" : type.color}
						/>
					</Animated.View>
					<View style={styles.wasteContent}>
						<ThemedText
							style={[
								styles.wasteType,
								priority === "today" && styles.wasteTodayType,
								priority === "future" && styles.wasteFutureType,
								{ color: textColor },
							]}
							numberOfLines={1}
							adjustsFontSizeToFit
							minimumFontScale={0.8}
						>
							{type.name}
						</ThemedText>
						{isToday || isTomorrow ? (
							<Animated.View style={styles.wasteDateRow}>
								<Animated.View
									style={[
										styles.wasteBadge,
										{ backgroundColor: type.color },
										priority === "today" && styles.wasteTodayBadge,
									]}
								>
									<ThemedText style={styles.wasteBadgeText}>
										{isToday ? "TODAY" : "TOMORROW"}
									</ThemedText>
								</Animated.View>
							</Animated.View>
						) : (
							<ThemedText
								style={[
									styles.wasteDate,
									priority === "future" && styles.wasteFutureDate,
									{ color: textColor },
								]}
							>
								{formattedDate}
							</ThemedText>
						)}
					</View>
				</AnimatedPressable>
			</Animated.View>
		);
	},
);

WasteCard.displayName = "WasteCard";

const styles = StyleSheet.create({
	wasteCardWrapper: {
		width: "50%",
		paddingHorizontal: 6,
		paddingBottom: 12,
	},
	wasteCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: SPACING.md,
		borderRadius: 18,
		marginBottom: 0,
		width: "100%",
		minHeight: 72, // Ensure consistent height for all cards
	},
	wasteIconContainer: {
		width: 38,
		height: 38,
		borderRadius: 19,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SPACING.sm + SPACING.xs,
		flexShrink: 0, // Prevent icon from shrinking
	},
	todayIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	wasteContent: {
		flex: 1,
		gap: SPACING.xs,
		justifyContent: "center", // Center content vertically
	},
	wasteType: {
		fontSize: 15,
		fontWeight: "600",
		letterSpacing: -0.2,
		lineHeight: 20,
	},
	wasteTodayType: {
		fontSize: 16,
		fontWeight: "700",
		letterSpacing: -0.3,
	},
	wasteFutureType: {
		fontSize: 15,
		fontWeight: "500",
	},
	wasteDate: {
		fontSize: 13,
		fontWeight: "500",
		opacity: 0.6,
		lineHeight: 18,
	},
	wasteFutureDate: {
		fontSize: 13,
		opacity: 0.5,
	},
	wasteDateRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	wasteBadge: {
		paddingHorizontal: SPACING.sm,
		paddingVertical: SPACING.xs,
		borderRadius: 8,
	},
	wasteTodayBadge: {
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	wasteBadgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#FFFFFF",
		letterSpacing: 0.5,
	},
});
