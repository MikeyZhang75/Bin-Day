import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import type { CouncilData } from "@/convex/councilServices";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useWasteSorting } from "@/hooks/useWasteSorting";
import { formatDate } from "@/utils/dateFormatters";
import { WasteCard, type WasteType } from "./WasteCard";

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
}

export function WasteCollectionGrid({
	councilData,
	isLoadingCouncilData,
}: WasteCollectionGridProps) {
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);
	const tintColor = useThemeColor({}, "tint");
	const sectionTitleColor = useThemeColor({}, "text");

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

	if (isLoadingCouncilData) {
		return (
			<View style={[styles.loadingCard, { backgroundColor: cardBgColor }]}>
				<ActivityIndicator size="large" color={tintColor} />
				<ThemedText style={styles.loadingText}>
					Loading collection dates...
				</ThemedText>
			</View>
		);
	}

	if (!councilData?.supported || !councilData?.result) {
		return null;
	}

	return (
		<View style={styles.container}>
			{/* Today Section */}
			{today.length > 0 && (
				<View style={styles.section}>
					<ThemedText
						style={[
							styles.sectionTitle,
							styles.todayTitle,
							{ color: sectionTitleColor },
						]}
					>
						Today
					</ThemedText>
					<View style={styles.wasteGrid}>
						{today.map((item) => (
							<WasteCard
								key={item.type.key}
								type={item.type}
								formattedDate={formatDate(item.date)}
							/>
						))}
					</View>
				</View>
			)}

			{/* Upcoming Section */}
			{upcoming.length > 0 && (
				<View style={styles.section}>
					<ThemedText
						style={[styles.sectionTitle, { color: sectionTitleColor }]}
					>
						Upcoming
					</ThemedText>
					<View style={styles.wasteGrid}>
						{upcoming.map((item) => (
							<WasteCard
								key={item.type.key}
								type={item.type}
								formattedDate={formatDate(item.date)}
							/>
						))}
					</View>
				</View>
			)}

			{/* Future Section */}
			{future.length > 0 && (
				<View style={styles.section}>
					<ThemedText
						style={[styles.sectionTitle, { color: sectionTitleColor }]}
					>
						Future Collections
					</ThemedText>
					<View style={styles.wasteGrid}>
						{future.map((item) => (
							<WasteCard
								key={item.type.key}
								type={item.type}
								formattedDate={formatDate(item.date)}
							/>
						))}
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 12,
		opacity: 0.8,
	},
	todayTitle: {
		fontSize: 20,
		fontWeight: "700",
		opacity: 1,
	},
	wasteGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	loadingCard: {
		padding: 40,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		fontSize: 16,
		opacity: 0.6,
		marginTop: 12,
	},
});
