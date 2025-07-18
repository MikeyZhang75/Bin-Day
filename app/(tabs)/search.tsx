// External package imports
import { useCallback, useEffect, useRef, useState } from "react";
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

// Internal absolute imports
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UnsupportedCouncilCard } from "@/components/UnsupportedCouncilCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { api } from "@/convex/_generated/api";
// Type imports
import type { CouncilData } from "@/convex/councilServices";
import type { CouncilName } from "@/convex/councils";
import { isValidCouncilName } from "@/convex/councils";
import { useThemeColor } from "@/hooks/useThemeColor";
import type {
	GooglePlaceDetails,
	GooglePrediction,
} from "@/types/googlePlaces";

// Helper function to format Unix timestamp to readable date
const formatDate = (timestamp: number | null): string => {
	if (!timestamp) return "Not available";
	const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
	return date.toLocaleDateString("en-AU", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

export default function SearchScreen() {
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [selectedCouncil, setSelectedCouncil] = useState<CouncilName | null>(
		null,
	);
	const [unsupportedCouncil, setUnsupportedCouncil] = useState<string | null>(
		null,
	);
	const [selectedPlaceDetails, setSelectedPlaceDetails] =
		useState<GooglePlaceDetails | null>(null);
	const [councilData, setCouncilData] = useState<CouncilData | null>(null);
	const [isLoadingCouncilData, setIsLoadingCouncilData] = useState(false);
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
	const getCouncilData = useAction(api.councilServices.getCouncilData);

	// Fetch council data when council changes
	useEffect(() => {
		if (selectedCouncil && selectedPlaceDetails) {
			// Clear previous council data immediately and set loading
			setCouncilData(null);
			setIsLoadingCouncilData(true);

			// Fetch new council data
			getCouncilData({
				council: selectedCouncil,
				placeDetails: selectedPlaceDetails,
			})
				.then((councilResponse) => {
					setCouncilData(councilResponse);
					setIsLoadingCouncilData(false);
				})
				.catch((error) => {
					console.error("Error fetching council data:", error);
					setCouncilData(null);
					setIsLoadingCouncilData(false);
				});
		} else {
			setCouncilData(null);
			setIsLoadingCouncilData(false);
		}
	}, [selectedCouncil, selectedPlaceDetails, getCouncilData]);

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

			if (response.result) {
				setSelectedAddress(response.result.formatted_address);
				setSelectedPlaceDetails(response.result);

				// Extract administrative_area_level_2 (council/municipality)
				const council = response.result.address_components.find((component) =>
					component.types.includes("administrative_area_level_2"),
				);

				if (council?.long_name) {
					if (isValidCouncilName(council.long_name)) {
						setSelectedCouncil(council.long_name);
						setUnsupportedCouncil(null);
					} else {
						setSelectedCouncil(null);
						setUnsupportedCouncil(council.long_name);
					}
				} else {
					// No council found in address components
					setSelectedCouncil(null);
					setUnsupportedCouncil(null);
				}
			} else {
				// Fallback to prediction description
				setSelectedAddress(prediction.description);
				setSelectedPlaceDetails(null);
				setSelectedCouncil(null);
				setUnsupportedCouncil(null);
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
			setSelectedPlaceDetails(null);
			setSelectedCouncil(null);
			setUnsupportedCouncil(null);
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
		setSelectedPlaceDetails(null);
		setSelectedCouncil(null);
		setUnsupportedCouncil(null);
		setCouncilData(null);
		inputRef.current?.focus();
	};

	const renderSearchResult = ({ item }: { item: GooglePrediction }) => {
		// Extract locality and state from the terms
		// Australia is always the last term, so:
		// - State (administrative_area_level_1) is the second-to-last term
		// - Locality is the third-to-last term
		const localityTerm =
			item.terms.length >= 3 ? item.terms[item.terms.length - 3] : null;
		const stateTerm =
			item.terms.length >= 2 ? item.terms[item.terms.length - 2] : null;

		// Create the second line text
		const secondLineText =
			localityTerm && stateTerm && stateTerm.value !== "Australia"
				? `${localityTerm.value} ${stateTerm.value}`
				: item.structured_formatting.secondary_text;

		return (
			<TouchableOpacity
				style={styles.resultItem}
				onPress={() => selectAddress(item)}
				activeOpacity={0.7}
			>
				<View style={styles.resultTextContainer}>
					<ThemedText style={styles.resultName}>
						{item.structured_formatting.main_text}
					</ThemedText>
					<ThemedText style={styles.resultAddress}>{secondLineText}</ThemedText>
				</View>
				<IconSymbol
					name="chevron.right"
					size={16}
					color={`${textColor}60`}
					style={styles.chevron}
				/>
			</TouchableOpacity>
		);
	};

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

				{/* Search Section - Only show when no address selected */}
				{!selectedAddress && (
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
				)}

				{/* Search Results Dropdown - Only show when no address selected */}
				{!selectedAddress && showResults && searchResults.length > 0 && (
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
								<Pressable
									onPress={clearSelectedAddress}
									accessibilityRole="button"
									accessibilityLabel="Clear selected address"
									accessibilityHint="Removes the selected address and allows you to search again"
								>
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

						{/* Council/Municipality Card */}
						{selectedCouncil && (
							<View
								style={[
									styles.councilCard,
									{ backgroundColor: cardBgColor, borderColor },
								]}
							>
								<View style={styles.councilHeader}>
									<IconSymbol
										name="building.columns"
										size={20}
										color={tintColor}
										style={styles.councilIcon}
									/>
									<ThemedText style={styles.councilLabel}>
										Council Area
									</ThemedText>
								</View>
								<ThemedText style={styles.councilName}>
									{selectedCouncil}
								</ThemedText>
								<View style={styles.councilDataSection}>
									{isLoadingCouncilData ? (
										<ThemedText style={styles.councilDataText}>
											Loading council data...
										</ThemedText>
									) : councilData ? (
										councilData.supported && councilData.result ? (
											<View style={styles.wasteCollectionContainer}>
												<ThemedText style={styles.wasteCollectionTitle}>
													Waste Collection Dates
												</ThemedText>

												{/* Landfill Waste */}
												<View style={styles.wasteItem}>
													<View
														style={[
															styles.wasteIconContainer,
															{ backgroundColor: "#FF6B6B20" },
														]}
													>
														<IconSymbol
															name="trash"
															size={20}
															color="#FF6B6B"
														/>
													</View>
													<View style={styles.wasteContent}>
														<ThemedText style={styles.wasteType}>
															Landfill Waste
														</ThemedText>
														<ThemedText style={styles.wasteDate}>
															{formatDate(councilData.result.landfillWaste)}
														</ThemedText>
													</View>
												</View>

												{/* Recycling */}
												<View style={styles.wasteItem}>
													<View
														style={[
															styles.wasteIconContainer,
															{ backgroundColor: "#FFC10720" },
														]}
													>
														<IconSymbol
															name="arrow.3.trianglepath"
															size={20}
															color="#FFC107"
														/>
													</View>
													<View style={styles.wasteContent}>
														<ThemedText style={styles.wasteType}>
															Recycling
														</ThemedText>
														<ThemedText style={styles.wasteDate}>
															{formatDate(councilData.result.recycling)}
														</ThemedText>
													</View>
												</View>

												{/* Food and Garden Waste */}
												<View style={styles.wasteItem}>
													<View
														style={[
															styles.wasteIconContainer,
															{ backgroundColor: "#4CAF5020" },
														]}
													>
														<IconSymbol name="leaf" size={20} color="#4CAF50" />
													</View>
													<View style={styles.wasteContent}>
														<ThemedText style={styles.wasteType}>
															Food & Garden Waste
														</ThemedText>
														<ThemedText style={styles.wasteDate}>
															{formatDate(
																councilData.result.foodAndGardenWaste,
															)}
														</ThemedText>
													</View>
												</View>

												{/* Hard Waste */}
												<View style={styles.wasteItem}>
													<View
														style={[
															styles.wasteIconContainer,
															{ backgroundColor: "#9E9E9E20" },
														]}
													>
														<IconSymbol
															name="shippingbox"
															size={20}
															color="#9E9E9E"
														/>
													</View>
													<View style={styles.wasteContent}>
														<ThemedText style={styles.wasteType}>
															Hard Waste
														</ThemedText>
														<ThemedText style={styles.wasteDate}>
															{formatDate(councilData.result.hardWaste)}
														</ThemedText>
													</View>
												</View>

												{/* Glass Recycling */}
												{councilData.result.glass && (
													<View style={styles.wasteItem}>
														<View
															style={[
																styles.wasteIconContainer,
																{ backgroundColor: "#00ACC120" },
															]}
														>
															<IconSymbol
																name="wineglass"
																size={20}
																color="#00ACC1"
															/>
														</View>
														<View style={styles.wasteContent}>
															<ThemedText style={styles.wasteType}>
																Glass Recycling
															</ThemedText>
															<ThemedText style={styles.wasteDate}>
																{formatDate(councilData.result.glass)}
															</ThemedText>
														</View>
													</View>
												)}
											</View>
										) : (
											<ThemedText style={styles.councilUnsupported}>
												{councilData.message}
											</ThemedText>
										)
									) : null}
								</View>
							</View>
						)}

						{/* Unsupported Council Card */}
						{unsupportedCouncil && !selectedCouncil && (
							<UnsupportedCouncilCard
								councilName={unsupportedCouncil}
								backgroundColor={cardBgColor}
								borderColor={borderColor}
							/>
						)}
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
	councilDataSection: {
		marginTop: 8,
		marginLeft: 28,
	},
	councilDataText: {
		fontSize: 14,
		opacity: 0.7,
		marginTop: 4,
	},
	councilUnsupported: {
		fontSize: 14,
		opacity: 0.5,
		fontStyle: "italic",
		marginTop: 4,
	},
	wasteCollectionContainer: {
		marginTop: 12,
	},
	wasteCollectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 12,
	},
	wasteItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	wasteIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	wasteContent: {
		flex: 1,
	},
	wasteType: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 2,
	},
	wasteDate: {
		fontSize: 13,
		opacity: 0.7,
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
