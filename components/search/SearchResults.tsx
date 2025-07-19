import { useCallback, useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { GooglePrediction } from "@/types/googlePlaces";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsProps {
	searchResults: GooglePrediction[];
	onSelectAddress: (prediction: GooglePrediction) => void;
}

// Custom entering animation - smooth fade in
const customEntering = FadeIn.duration(300).easing(Easing.out(Easing.cubic));

// Custom exiting animation - smooth fade out
const customExiting = FadeOut.duration(250).easing(Easing.in(Easing.cubic));

export function SearchResults({
	searchResults,
	onSelectAddress,
}: SearchResultsProps) {
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);

	// Get screen dimensions for dynamic height calculation
	const screenHeight = Dimensions.get("window").height;
	const maxVisibleHeight = screenHeight * 0.5; // 50% of screen height

	// Use search results directly
	const displayData = useMemo(() => searchResults || [], [searchResults]);

	// Calculate actual content height based on display data
	const itemHeight = 72; // minHeight from SearchResultItem
	const separatorHeight = 1;
	const totalItemHeight = itemHeight + separatorHeight;
	const totalContentHeight = Math.max(
		0,
		displayData.length * totalItemHeight - separatorHeight,
	);

	// Determine if scrolling is needed
	const needsScroll = totalContentHeight > maxVisibleHeight;

	// Memoize callbacks
	const renderItem = useCallback(
		({ item }: { item: GooglePrediction }) => (
			<SearchResultItem
				prediction={item}
				onPress={() => onSelectAddress(item)}
			/>
		),
		[onSelectAddress],
	);

	const keyExtractor = useCallback(
		(item: GooglePrediction) => item.place_id,
		[],
	);

	// Optimized getItemLayout with correct separator calculations
	const getItemLayout = useCallback(
		(_: ArrayLike<GooglePrediction> | null | undefined, index: number) => ({
			length: 72, // itemHeight constant
			offset: 73 * index, // (itemHeight + separatorHeight) * index
			index,
		}),
		[],
	);

	const itemSeparatorComponent = useCallback(
		() => <View style={[styles.separator, { backgroundColor: borderColor }]} />,
		[borderColor],
	);

	return (
		<Animated.View
			entering={customEntering}
			exiting={customExiting}
			style={styles.shadowWrapper}
			pointerEvents="auto"
		>
			<View
				style={[
					styles.resultsContainer,
					{
						backgroundColor: cardBgColor,
						borderColor,
						maxHeight: maxVisibleHeight,
					},
				]}
			>
				<FlatList
					data={displayData || []}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					keyboardShouldPersistTaps="always"
					scrollEnabled={needsScroll}
					removeClippedSubviews={false}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={10}
					getItemLayout={getItemLayout}
					ItemSeparatorComponent={itemSeparatorComponent}
					showsVerticalScrollIndicator={needsScroll}
					bounces={false}
					contentContainerStyle={{ flexGrow: 1 }}
					extraData={displayData.length}
				/>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	shadowWrapper: {
		position: "absolute",
		top: 64,
		left: 0,
		right: 0,
		zIndex: 1000, // Ensure dropdown appears above other content
		// Removed maxHeight to allow flexible sizing
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
		// Ensure the container can grow to show content
		flexShrink: 0,
	},
	separator: {
		height: 1,
		marginHorizontal: 16,
	},
});
