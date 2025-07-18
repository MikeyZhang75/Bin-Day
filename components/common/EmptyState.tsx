import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

export function EmptyState() {
	const tintColor = useThemeColor({}, "tint");

	return (
		<View style={styles.emptyState}>
			<View
				style={[
					styles.emptyIconContainer,
					{ backgroundColor: `${tintColor}15` },
				]}
			>
				<IconSymbol name="magnifyingglass" size={48} color={tintColor} />
			</View>
			<ThemedText style={styles.emptyTitle}>Search for your address</ThemedText>
			<ThemedText style={styles.emptyText}>
				Enter your street address to find your{"\n"}waste collection schedule
			</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyIconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "600",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 16,
		opacity: 0.6,
		textAlign: "center",
		lineHeight: 22,
	},
});
