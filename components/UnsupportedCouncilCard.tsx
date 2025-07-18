// External package imports
import { StyleSheet, View } from "react-native";

// Internal absolute imports
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface UnsupportedCouncilCardProps {
	councilName: string;
	backgroundColor: string;
	borderColor: string;
}

export function UnsupportedCouncilCard({
	councilName,
	backgroundColor,
	borderColor,
}: UnsupportedCouncilCardProps) {
	return (
		<View style={[styles.councilCard, { backgroundColor, borderColor }]}>
			<View style={styles.councilHeader}>
				<IconSymbol
					name="exclamationmark.triangle"
					size={20}
					color="#FF9500"
					style={styles.councilIcon}
				/>
				<ThemedText style={styles.councilLabel}>
					Council Not Supported
				</ThemedText>
			</View>
			<ThemedText style={styles.councilName}>{councilName}</ThemedText>
			<View style={styles.unsupportedContent}>
				<ThemedText style={styles.unsupportedText}>
					This council is not currently supported by our service.
				</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	councilCard: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
		marginTop: 12,
	},
	councilHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	councilIcon: {
		marginRight: 8,
	},
	councilLabel: {
		fontSize: 14,
		fontWeight: "600",
		opacity: 0.6,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	councilName: {
		fontSize: 18,
		fontWeight: "500",
		marginLeft: 28,
	},
	unsupportedContent: {
		marginTop: 12,
		marginLeft: 28,
	},
	unsupportedText: {
		fontSize: 14,
		opacity: 0.7,
	},
});
