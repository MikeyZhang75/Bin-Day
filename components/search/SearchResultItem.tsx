import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { GooglePrediction } from "@/types/googlePlaces";

interface SearchResultItemProps {
	prediction: GooglePrediction;
	onPress: () => void;
}

export const SearchResultItem = React.memo(
	({ prediction, onPress }: SearchResultItemProps) => {
		const tintColor = useThemeColor({}, "tint");

		const localityTerm =
			prediction.terms.length >= 3
				? prediction.terms[prediction.terms.length - 3]
				: null;
		const stateTerm =
			prediction.terms.length >= 2
				? prediction.terms[prediction.terms.length - 2]
				: null;

		const secondLineText =
			localityTerm && stateTerm && stateTerm.value !== "Australia"
				? `${localityTerm.value} ${stateTerm.value}`
				: prediction.structured_formatting.secondary_text;

		return (
			<TouchableOpacity
				style={styles.resultItem}
				onPress={onPress}
				activeOpacity={0.7}
				accessible={true}
				accessibilityLabel={`Select address: ${prediction.structured_formatting.main_text}`}
				accessibilityHint={"Select this address to view waste collection dates"}
			>
				<View style={styles.resultIconContainer}>
					<IconSymbol name="location" size={20} color={tintColor} />
				</View>
				<View style={styles.resultTextContainer}>
					<ThemedText style={styles.resultName}>
						{prediction.structured_formatting.main_text}
					</ThemedText>
					<ThemedText style={styles.resultAddress}>{secondLineText}</ThemedText>
				</View>
			</TouchableOpacity>
		);
	},
);

SearchResultItem.displayName = "SearchResultItem";

const styles = StyleSheet.create({
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		minHeight: 72,
	},
	resultIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "rgba(0,122,255,0.1)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	resultTextContainer: {
		flex: 1,
	},
	resultName: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 4,
	},
	resultAddress: {
		fontSize: 14,
		opacity: 0.6,
	},
});
