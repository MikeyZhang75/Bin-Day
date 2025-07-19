import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { CouncilData } from "@/convex/councilServices";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWasteSorting } from "@/hooks/useWasteSorting";
import { formatDate } from "@/utils/dateFormatters";
import { WasteCard, type WasteType } from "./WasteCard";

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
	staggerDelay: 50,
	easing: Easing.bezier(0.25, 0.1, 0.25, 1),
	spring: {
		damping: 18,
		stiffness: 200,
	},
} as const;

const WASTE_TYPES: WasteType[] = [
	{
		key: "landfillWaste",
		name: "Landfill",
		icon: "trash",
		color: "#FF4444",
		bgColor: "#FF444415",
	},
	{
		key: "recycling",
		name: "Recycling",
		icon: "arrow.3.trianglepath",
		color: "#FFA500",
		bgColor: "#FFA50015",
	},
	{
		key: "foodAndGardenWaste",
		name: "Organic",
		icon: "leaf",
		color: "#4CAF50",
		bgColor: "#4CAF5015",
	},
	{
		key: "hardWaste",
		name: "Hard Waste",
		icon: "shippingbox",
		color: "#9E9E9E",
		bgColor: "#9E9E9E15",
	},
	{
		key: "glass",
		name: "Glass",
		icon: "wineglass",
		color: "#9C27B0",
		bgColor: "#9C27B015",
	},
];

interface WasteCollectionGridProps {
	councilData: CouncilData | null;
	isLoadingCouncilData: boolean;
	onCardPress?: (wasteType: WasteType) => void;
}

// Skeleton loading component
const SkeletonCard = ({ delay }: { delay: number }) => {
	const shimmerAnim = useSharedValue(0);
	const colorScheme =
		useThemeColor({}, "background") === "#FFFFFF" ? "light" : "dark";

	useEffect(() => {
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
	}, [delay, shimmerAnim]);

	const animatedStyle = useAnimatedStyle(() => {
		const translateX = shimmerAnim.value * 200;
		return {
			transform: [{ translateX }],
		};
	});

	return (
		<View style={styles.skeletonCardWrapper}>
			<View style={styles.skeletonCard}>
				<View style={styles.skeletonIconContainer}>
					<Animated.View style={[styles.shimmer, animatedStyle]}>
						<LinearGradient
							colors={
								colorScheme === "light"
									? ["transparent", "rgba(255,255,255,0.8)", "transparent"]
									: ["transparent", "rgba(255,255,255,0.1)", "transparent"]
							}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={StyleSheet.absoluteFillObject}
						/>
					</Animated.View>
				</View>
				<View style={styles.skeletonContent}>
					<View style={styles.skeletonTitle} />
					<View style={styles.skeletonSubtitle} />
				</View>
			</View>
		</View>
	);
};

export function WasteCollectionGrid({
	councilData,
	isLoadingCouncilData,
	onCardPress,
}: WasteCollectionGridProps) {
	// Theme colors
	const tintColor = useThemeColor({}, "tint");
	const textColor = useThemeColor({}, "text");
	const sectionBgColor = useThemeColor(
		{ light: "rgba(0,0,0,0.02)", dark: "rgba(255,255,255,0.02)" },
		"background",
	);
	const borderColor = useThemeColor(
		{ light: "rgba(0,0,0,0.04)", dark: "rgba(255,255,255,0.04)" },
		"text",
	);

	// Create waste items array, but it will be empty if no data
	const unsortedWasteItems =
		councilData?.supported && councilData?.result
			? WASTE_TYPES.map((type) => {
					const date = councilData.result?.[
						type.key as keyof typeof councilData.result
					] as number | null;
					// Don't display any card with N/A date
					if (!date) return null;
					return { type, date };
				})
			: [];

	// Always call the hook
	const { today, upcoming, future } = useWasteSorting(unsortedWasteItems);

	// Entry animation trigger
	useEffect(() => {
		if (!isLoadingCouncilData && councilData && Platform.OS === "ios") {
			// Subtle haptic when data loads
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	}, [isLoadingCouncilData, councilData]);

	// Render skeleton loading state
	if (isLoadingCouncilData) {
		return (
			<View style={styles.container}>
				<Animated.View
					entering={FadeIn.duration(300)}
					style={styles.skeletonSection}
				>
					<View style={styles.skeletonSectionTitle} />
					<View style={styles.wasteGrid}>
						{[0, 1].map((index) => (
							<SkeletonCard key={index} delay={index * 100} />
						))}
					</View>
				</Animated.View>
				<Animated.View
					entering={FadeIn.duration(300).delay(150)}
					style={styles.skeletonSection}
				>
					<View style={styles.skeletonSectionTitle} />
					<View style={styles.wasteGrid}>
						{[0, 1, 2].map((index) => (
							<SkeletonCard key={index} delay={index * 100 + 200} />
						))}
					</View>
				</Animated.View>
			</View>
		);
	}

	if (!councilData?.supported || !councilData?.result) {
		return null;
	}

	// Calculate total card count for stagger delay
	let cardIndex = 0;

	return (
		<View style={styles.container}>
			{/* Today Section */}
			{today.length > 0 && (
				<Animated.View
					entering={FadeInDown.duration(ANIMATION_CONFIG.duration)
						.easing(ANIMATION_CONFIG.easing)
						.springify()
						.damping(ANIMATION_CONFIG.spring.damping)
						.stiffness(ANIMATION_CONFIG.spring.stiffness)}
					style={[styles.section, styles.todaySection]}
				>
					<ThemedView
						style={[
							styles.sectionContainer,
							{
								backgroundColor: `${tintColor}08`,
								borderColor: `${tintColor}15`,
							},
						]}
					>
						<ThemedText
							style={[
								styles.sectionTitle,
								styles.todayTitle,
								{ color: textColor },
							]}
						>
							Today
						</ThemedText>
						<View style={styles.wasteGrid}>
							{today.map((item) => {
								const delay = cardIndex++ * ANIMATION_CONFIG.staggerDelay;
								return (
									<WasteCard
										key={item.type.key}
										type={item.type}
										formattedDate={formatDate(item.date)}
										priority="today"
										animationDelay={delay}
										onPress={() => onCardPress?.(item.type)}
									/>
								);
							})}
						</View>
					</ThemedView>
				</Animated.View>
			)}

			{/* Upcoming Section */}
			{upcoming.length > 0 && (
				<Animated.View
					entering={FadeInDown.duration(ANIMATION_CONFIG.duration)
						.delay(100)
						.easing(ANIMATION_CONFIG.easing)
						.springify()
						.damping(ANIMATION_CONFIG.spring.damping)
						.stiffness(ANIMATION_CONFIG.spring.stiffness)}
					style={styles.section}
				>
					<ThemedView
						style={[
							styles.sectionContainer,
							{ backgroundColor: sectionBgColor, borderColor },
						]}
					>
						<ThemedText style={[styles.sectionTitle, { color: textColor }]}>
							Upcoming
						</ThemedText>
						<View style={styles.wasteGrid}>
							{upcoming.map((item) => {
								const delay = cardIndex++ * ANIMATION_CONFIG.staggerDelay;
								return (
									<WasteCard
										key={item.type.key}
										type={item.type}
										formattedDate={formatDate(item.date)}
										priority="upcoming"
										animationDelay={delay}
										onPress={() => onCardPress?.(item.type)}
									/>
								);
							})}
						</View>
					</ThemedView>
				</Animated.View>
			)}

			{/* Future Section */}
			{future.length > 0 && (
				<Animated.View
					entering={FadeInDown.duration(ANIMATION_CONFIG.duration)
						.delay(200)
						.easing(ANIMATION_CONFIG.easing)
						.springify()
						.damping(ANIMATION_CONFIG.spring.damping)
						.stiffness(ANIMATION_CONFIG.spring.stiffness)}
					style={styles.section}
				>
					<ThemedView
						style={[
							styles.sectionContainer,
							{ backgroundColor: sectionBgColor, borderColor },
						]}
					>
						<ThemedText
							style={[
								styles.sectionTitle,
								styles.futureTitle,
								{ color: textColor },
							]}
						>
							Future Collections
						</ThemedText>
						<View style={styles.wasteGrid}>
							{future.map((item) => {
								const delay = cardIndex++ * ANIMATION_CONFIG.staggerDelay;
								return (
									<WasteCard
										key={item.type.key}
										type={item.type}
										formattedDate={formatDate(item.date)}
										priority="future"
										animationDelay={delay}
										onPress={() => onCardPress?.(item.type)}
									/>
								);
							})}
						</View>
					</ThemedView>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	section: {
		marginBottom: SPACING.lg,
	},
	todaySection: {
		marginBottom: SPACING.xl,
	},
	sectionContainer: {
		padding: SPACING.md,
		borderRadius: 20,
		borderWidth: 1,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.04,
				shadowRadius: 8,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: SPACING.md,
		letterSpacing: -0.3,
		opacity: 0.8,
	},
	todayTitle: {
		fontSize: 22,
		fontWeight: "700",
		opacity: 1,
		letterSpacing: -0.5,
	},
	futureTitle: {
		opacity: 0.7,
		fontSize: 17,
	},
	wasteGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginHorizontal: -6,
	},
	// Skeleton loading styles
	skeletonSection: {
		marginBottom: SPACING.lg,
	},
	skeletonSectionTitle: {
		width: 120,
		height: 24,
		backgroundColor: "rgba(128,128,128,0.1)",
		borderRadius: 12,
		marginBottom: SPACING.md,
	},
	skeletonCardWrapper: {
		width: "50%",
		paddingHorizontal: 6,
		paddingBottom: 12,
	},
	skeletonCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 14,
		borderRadius: 16,
		backgroundColor: "rgba(128,128,128,0.05)",
		overflow: "hidden",
	},
	skeletonIconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "rgba(128,128,128,0.1)",
		marginRight: 12,
		overflow: "hidden",
	},
	skeletonContent: {
		flex: 1,
	},
	skeletonTitle: {
		width: "70%",
		height: 16,
		backgroundColor: "rgba(128,128,128,0.1)",
		borderRadius: 8,
		marginBottom: 6,
	},
	skeletonSubtitle: {
		width: "50%",
		height: 12,
		backgroundColor: "rgba(128,128,128,0.08)",
		borderRadius: 6,
	},
	shimmer: {
		position: "absolute",
		top: 0,
		left: -200,
		right: 0,
		bottom: 0,
		width: 200,
	},
});
