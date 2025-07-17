import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface UnsupportedCouncilCardProps {
	councilName: string;
	onViewSupportedCouncils: () => void;
	backgroundColor: string;
	borderColor: string;
	tintColor: string;
}

export function UnsupportedCouncilCard({
	councilName,
	onViewSupportedCouncils,
	backgroundColor,
	borderColor,
	tintColor,
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
				<Pressable
					style={styles.infoButton}
					onPress={onViewSupportedCouncils}
					accessibilityRole="button"
					accessibilityLabel="View list of supported councils"
					accessibilityHint="Opens a modal showing all councils supported by this service"
				>
					<IconSymbol
						name="info.circle"
						size={20}
						color={tintColor}
						style={styles.infoIcon}
					/>
					<ThemedText style={[styles.infoButtonText, { color: tintColor }]}>
						View supported councils
					</ThemedText>
				</Pressable>
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
		marginBottom: 12,
	},
	infoButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
	},
	infoIcon: {
		marginRight: 8,
	},
	infoButtonText: {
		fontSize: 14,
		fontWeight: "500",
	},
});
