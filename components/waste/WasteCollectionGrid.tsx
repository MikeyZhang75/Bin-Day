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

	// Create waste items array, but it will be empty if no data
	const unsortedWasteItems =
		councilData?.supported && councilData?.result
			? WASTE_TYPES.map((type) => {
					const date = councilData.result?.[
						type.key as keyof typeof councilData.result
					] as number | null;
					if (type.key === "glass" && !date) return null;
					return { type, date };
				})
			: [];

	// Always call the hook
	const wasteItems = useWasteSorting(unsortedWasteItems);

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
		<View style={styles.wasteGrid}>
			{wasteItems.map(
				(item) =>
					item && (
						<WasteCard
							key={item.type.key}
							type={item.type}
							formattedDate={formatDate(item.date)}
						/>
					),
			)}
		</View>
	);
}

const styles = StyleSheet.create({
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
