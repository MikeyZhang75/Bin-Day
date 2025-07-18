import { StyleSheet, View } from "react-native";
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
}

export function WasteCard({ type, formattedDate }: WasteCardProps) {
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);

	const isToday = formattedDate === "Today";
	const isTomorrow = formattedDate === "Tomorrow";

	return (
		<View
			style={[
				styles.wasteCard,
				{
					backgroundColor: isToday ? `${type.color}10` : cardBgColor,
					borderColor: isToday || isTomorrow ? type.color : borderColor,
					borderWidth: isToday ? 2 : 1,
				},
				isToday && styles.wasteCardToday,
			]}
		>
			<View
				style={[
					styles.wasteIconContainer,
					{
						backgroundColor: isToday ? type.color : type.bgColor,
					},
				]}
			>
				<IconSymbol
					name={type.icon}
					size={isToday ? 24 : 22}
					color={isToday ? "#FFFFFF" : type.color}
				/>
			</View>
			<View style={styles.wasteContent}>
				<ThemedText
					style={[styles.wasteType, isToday && { fontWeight: "700" }]}
				>
					{type.name}
				</ThemedText>
				{isToday || isTomorrow ? (
					<View style={styles.wasteDateRow}>
						<View style={[styles.wasteBadge, { backgroundColor: type.color }]}>
							<ThemedText style={styles.wasteBadgeText}>
								{isToday ? "TODAY" : "TOMORROW"}
							</ThemedText>
						</View>
					</View>
				) : (
					<ThemedText style={styles.wasteDate}>{formattedDate}</ThemedText>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wasteCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 14,
		borderRadius: 16,
		marginBottom: 0,
		flex: 1,
		minWidth: "47%",
	},
	wasteCardToday: {
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	wasteIconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	wasteContent: {
		flex: 1,
	},
	wasteType: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 2,
	},
	wasteDate: {
		fontSize: 14,
		opacity: 0.6,
	},
	wasteDateRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
	},
	wasteBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	wasteBadgeText: {
		fontSize: 10,
		fontWeight: "700",
		color: "#FFFFFF",
		letterSpacing: 0.5,
	},
});
