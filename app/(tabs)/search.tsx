import { useCallback, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	Keyboard,
	Platform,
	Pressable,
	SafeAreaView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import "react-native-get-random-values";
import { useAction } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { api } from "@/convex/_generated/api";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { GooglePrediction } from "@/types/googlePlaces";

export default function SearchScreen() {
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<GooglePrediction[]>([]);
	const [sessionToken, setSessionToken] = useState<string>(uuidv4());
	const [showResults, setShowResults] = useState(false);
	const inputRef = useRef<TextInput>(null);

	// Theme colors
	const textColor = useThemeColor({}, "text");
	const backgroundColor = useThemeColor({}, "background");
	const tintColor = useThemeColor({}, "tint");
	const borderColor = useThemeColor({ light: "#e1e1e1", dark: "#333" }, "text");
	const cardBgColor = useThemeColor(
		{ light: "#f8f8f8", dark: "#1a1a1a" },
		"text",
	);

	// Convex actions
	const autocomplete = useAction(api.googlePlaces.autocomplete);
	const placeDetails = useAction(api.googlePlaces.placeDetails);

	const searchForAddress = useCallback(
		async (query: string) => {
			if (query.length < 3) {
				setSearchResults([]);
				setShowResults(false);
				return;
			}

			try {
				const response = await autocomplete({
					input: query,
					sessionToken,
				});

				console.log("response", JSON.stringify(response, null, 2));

				if (response.predictions && response.predictions.length > 0) {
					setSearchResults(response.predictions);
					setShowResults(true);
				} else {
					setSearchResults([]);
					setShowResults(false);
				}
			} catch (error) {
				console.error("Error searching for address:", error);
				Alert.alert("Error", "Failed to search for addresses");
			}
		},
		[sessionToken, autocomplete],
	);

	const selectAddress = async (prediction: GooglePrediction) => {
		try {
			const response = await placeDetails({
				placeId: prediction.place_id,
				sessionToken,
			});

			console.log("response", JSON.stringify(response, null, 2));

			if (response.result) {
				setSelectedAddress(response.result.formatted_address);
			} else {
				// Fallback to prediction description
				setSelectedAddress(prediction.description);
			}

			setSearchResults([]);
			setSearchQuery("");
			setShowResults(false);
			// Generate new session token for next search
			setSessionToken(uuidv4());
			Keyboard.dismiss();
		} catch (error) {
			console.error("Error retrieving full address:", error);
			// Fallback to prediction description
			setSelectedAddress(prediction.description);
			setSearchResults([]);
			setSearchQuery("");
			setShowResults(false);
			setSessionToken(uuidv4());
			Keyboard.dismiss();
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
		setSearchResults([]);
		setShowResults(false);
	};

	const clearSelectedAddress = () => {
		setSelectedAddress(null);
		inputRef.current?.focus();
	};

	const renderSearchResult = ({ item }: { item: GooglePrediction }) => (
		<TouchableOpacity
			style={styles.resultItem}
			onPress={() => selectAddress(item)}
			activeOpacity={0.7}
		>
			<View style={styles.resultTextContainer}>
				<ThemedText style={styles.resultName}>
					{item.structured_formatting.main_text}
				</ThemedText>
				<ThemedText style={styles.resultAddress}>
					{item.structured_formatting.secondary_text}
				</ThemedText>
			</View>
			<IconSymbol
				name="chevron.right"
				size={16}
				color={`${textColor}60`}
				style={styles.chevron}
			/>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor }]}>
			<ThemedView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<ThemedText type="title" style={styles.title}>
						Find Your Address
					</ThemedText>
					<ThemedText style={styles.subtitle}>
						Search for addresses in Australia
					</ThemedText>
				</View>

				{/* Search Section */}
				<View style={styles.searchSection}>
					<View
						style={[
							styles.searchContainer,
							{ borderColor: borderColor, backgroundColor },
						]}
					>
						<IconSymbol
							name="magnifyingglass"
							size={20}
							color={`${textColor}60`}
							style={styles.searchIcon}
						/>
						<TextInput
							ref={inputRef}
							style={[styles.searchInput, { color: textColor }]}
							placeholder="Enter street address, suburb or postcode"
							placeholderTextColor={`${textColor}60`}
							value={searchQuery}
							onChangeText={(text) => {
								setSearchQuery(text);
								searchForAddress(text);
							}}
							onFocus={() => {
								if (searchResults.length > 0) {
									setShowResults(true);
								}
							}}
							returnKeyType="search"
							autoCorrect={false}
							autoCapitalize="none"
						/>
						{searchQuery.length > 0 && (
							<Pressable onPress={clearSearch} style={styles.clearButton}>
								<IconSymbol
									name="xmark.circle.fill"
									size={20}
									color={`${textColor}40`}
								/>
							</Pressable>
						)}
					</View>
				</View>

				{/* Search Results Dropdown */}
				{showResults && searchResults.length > 0 && (
					<View style={styles.resultsWrapper}>
						<View
							style={[
								styles.resultsContainer,
								{ backgroundColor, borderColor },
							]}
						>
							<FlatList
								data={searchResults}
								keyExtractor={(item) => item.place_id}
								renderItem={renderSearchResult}
								ItemSeparatorComponent={() => (
									<View
										style={[styles.separator, { backgroundColor: borderColor }]}
									/>
								)}
								showsVerticalScrollIndicator={false}
								scrollEnabled={searchResults.length > 3}
								keyboardShouldPersistTaps="always"
							/>
						</View>
					</View>
				)}

				{/* Selected Address */}
				{selectedAddress && (
					<View style={styles.selectedSection}>
						<View
							style={[
								styles.selectedCard,
								{ backgroundColor: cardBgColor, borderColor },
							]}
						>
							<View style={styles.selectedHeader}>
								<ThemedText style={styles.selectedLabel}>
									Selected Address
								</ThemedText>
								<Pressable onPress={clearSelectedAddress}>
									<IconSymbol name="xmark" size={20} color={`${textColor}60`} />
								</Pressable>
							</View>
							<View style={styles.selectedContent}>
								<IconSymbol
									name="checkmark.circle.fill"
									size={24}
									color={tintColor}
									style={styles.selectedIcon}
								/>
								<ThemedText style={styles.selectedAddress}>
									{selectedAddress}
								</ThemedText>
							</View>
						</View>
					</View>
				)}

				{/* Empty State */}
				{!selectedAddress && searchQuery.length === 0 && (
					<View style={styles.emptyState}>
						<IconSymbol
							name="map"
							size={64}
							color={`${textColor}20`}
							style={styles.emptyIcon}
						/>
						<ThemedText style={styles.emptyText}>
							Start typing to search for an address
						</ThemedText>
					</View>
				)}
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: Platform.OS === "android" ? 20 : 0,
		paddingBottom: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		opacity: 0.6,
	},
	searchSection: {
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.5,
		borderRadius: 12,
		paddingHorizontal: 16,
		height: 52,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		paddingVertical: 0,
	},
	clearButton: {
		marginLeft: 8,
		padding: 4,
	},
	resultsWrapper: {
		paddingHorizontal: 20,
		zIndex: 1000,
	},
	resultsContainer: {
		borderRadius: 12,
		borderWidth: 1,
		maxHeight: 250,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
		overflow: "hidden",
	},
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	resultTextContainer: {
		flex: 1,
		marginRight: 8,
	},
	resultName: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 2,
	},
	resultAddress: {
		fontSize: 14,
		opacity: 0.6,
	},
	chevron: {
		opacity: 0.4,
	},
	separator: {
		height: 1,
	},
	selectedSection: {
		paddingHorizontal: 20,
		marginTop: 20,
	},
	selectedCard: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
	},
	selectedHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	selectedLabel: {
		fontSize: 14,
		fontWeight: "600",
		opacity: 0.6,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	selectedContent: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	selectedIcon: {
		marginRight: 12,
		marginTop: 2,
	},
	selectedAddress: {
		flex: 1,
		fontSize: 18,
		fontWeight: "500",
		lineHeight: 24,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyIcon: {
		marginBottom: 20,
	},
	emptyText: {
		fontSize: 16,
		opacity: 0.4,
		textAlign: "center",
	},
});
