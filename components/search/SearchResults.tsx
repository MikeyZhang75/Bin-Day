import { Animated, FlatList, StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { GooglePrediction } from "@/types/googlePlaces";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsProps {
	searchResults: GooglePrediction[];
	showResults: boolean;
	onSelectAddress: (prediction: GooglePrediction) => void;
	resultsOpacityAnim: Animated.Value;
	resultsScaleAnim: Animated.Value;
}

export function SearchResults({
	searchResults,
	showResults,
	onSelectAddress,
	resultsOpacityAnim,
	resultsScaleAnim,
}: SearchResultsProps) {
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);

	if (searchResults.length === 0) {
		return null;
	}

	return (
		<View style={styles.shadowWrapper} pointerEvents={showResults ? "auto" : "none"}>
			<Animated.View
				style={[
					styles.resultsContainer,
					{
						backgroundColor: cardBgColor,
						borderColor,
						opacity: resultsOpacityAnim,
						transform: [{ scale: resultsScaleAnim }],
					},
				]}
				onStartShouldSetResponder={() => true}
				onResponderTerminationRequest={() => false}
			>
				<FlatList
				data={searchResults.slice(0, 3)}
				renderItem={({ item }) => (
					<SearchResultItem
						prediction={item}
						onPress={() => onSelectAddress(item)}
					/>
				)}
				keyExtractor={(item) => item.place_id}
				keyboardShouldPersistTaps="always"
				scrollEnabled={false}
				ItemSeparatorComponent={() => (
					<View style={[styles.separator, { backgroundColor: borderColor }]} />
				)}
			/>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	shadowWrapper: {
		position: "absolute",
		top: 64,
		left: 0,
		right: 0,
		maxHeight: 240,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	resultsContainer: {
		borderRadius: 16,
		borderWidth: 1,
		overflow: "hidden",
	},
	separator: {
		height: 1,
		marginHorizontal: 16,
	},
});
