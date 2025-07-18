// External package imports
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Easing,
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
import { extractAddressComponents } from "@/lib/addressExtractor";
import type {
	GooglePlaceDetails,
	GooglePrediction,
} from "@/types/googlePlaces";

// Helper function to format Unix timestamp to readable date
const formatDate = (timestamp: number | null): string => {
	if (!timestamp) return "Not scheduled";
	const date = new Date(timestamp * 1000);
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	// Check if date is today
	if (date.toDateString() === today.toDateString()) {
		return "Today";
	}

	// Check if date is tomorrow
	if (date.toDateString() === tomorrow.toDateString()) {
		return "Tomorrow";
	}

	// Otherwise return formatted date
	return date.toLocaleDateString("en-AU", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
};

const WASTE_TYPES = [
	{
		key: "landfillWaste",
		name: "Landfill",
		icon: "trash" as const,
		color: "#FF4444",
		bgColor: "#FF444415",
	},
	{
		key: "recycling",
		name: "Recycling",
		icon: "arrow.3.trianglepath" as const,
		color: "#FFA500",
		bgColor: "#FFA50015",
	},
	{
		key: "foodAndGardenWaste",
		name: "Organic",
		icon: "leaf" as const,
		color: "#4CAF50",
		bgColor: "#4CAF5015",
	},
	{
		key: "hardWaste",
		name: "Hard Waste",
		icon: "shippingbox" as const,
		color: "#9E9E9E",
		bgColor: "#9E9E9E15",
	},
	{
		key: "glass",
		name: "Glass",
		icon: "wineglass" as const,
		color: "#2196F3",
		bgColor: "#2196F315",
	},
];

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
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const inputRef = useRef<TextInput>(null);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const emptyStateFadeAnim = useRef(new Animated.Value(1)).current;
	const resultsOpacityAnim = useRef(new Animated.Value(0)).current;
	const resultsScaleAnim = useRef(new Animated.Value(0.95)).current;
	const inputFocusAnim = useRef(new Animated.Value(0)).current;

	// Theme colors
	const textColor = useThemeColor({}, "text");
	const backgroundColor = useThemeColor({}, "background");
	const tintColor = useThemeColor({}, "tint");
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);

	// Animated colors
	const animatedBorderColor = inputFocusAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [borderColor, tintColor],
	});

	// Convex actions
	const autocomplete = useAction(api.googlePlaces.autocomplete);
	const placeDetails = useAction(api.googlePlaces.placeDetails);
	const getCouncilData = useAction(api.councilServices.getCouncilData);

	// Animations
	useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: selectedAddress ? 1 : 0,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [selectedAddress, fadeAnim]);

	// Empty state animation - subtle fade to match layout animation
	useEffect(() => {
		Animated.timing(emptyStateFadeAnim, {
			toValue: isSearching ? 0.2 : 1, // Fade to 20% opacity instead of 0
			duration: 300,
			easing: Easing.inOut(Easing.ease),
			useNativeDriver: true,
		}).start();
	}, [isSearching, emptyStateFadeAnim]);

	// Search results animation
	useEffect(() => {
		if (showResults && searchResults.length > 0) {
			// Animate in
			Animated.parallel([
				Animated.timing(resultsOpacityAnim, {
					toValue: 1,
					duration: 300,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(resultsScaleAnim, {
					toValue: 1,
					duration: 300,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// Animate out
			Animated.parallel([
				Animated.timing(resultsOpacityAnim, {
					toValue: 0,
					duration: 300,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(resultsScaleAnim, {
					toValue: 0.95,
					duration: 300,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [showResults, searchResults.length, resultsOpacityAnim, resultsScaleAnim]);

	// Input focus animation
	useEffect(() => {
		Animated.timing(inputFocusAnim, {
			toValue: isSearchFocused ? 1 : 0,
			duration: 300,
			easing: Easing.inOut(Easing.ease),
			useNativeDriver: false, // Can't use native driver for color animations
		}).start();
	}, [isSearchFocused, inputFocusAnim]);

	// Fetch council data when council changes
	useEffect(() => {
		if (selectedCouncil && selectedPlaceDetails) {
			setCouncilData(null);
			setIsLoadingCouncilData(true);

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
					setSelectedCouncil(null);
					setUnsupportedCouncil(null);
				}
			} else {
				setSelectedAddress(prediction.description);
				setSelectedPlaceDetails(null);
				setSelectedCouncil(null);
				setUnsupportedCouncil(null);
			}

			setSearchResults([]);
			setSearchQuery("");
			setShowResults(false);
			setSessionToken(uuidv4());
			Keyboard.dismiss();
			setIsSearchFocused(false);
			setIsSearching(false);
		} catch (error) {
			console.error("Error retrieving full address:", error);
			setSelectedAddress(prediction.description);
			setSelectedPlaceDetails(null);
			setSelectedCouncil(null);
			setUnsupportedCouncil(null);
			setSearchResults([]);
			setSearchQuery("");
			setShowResults(false);
			setSessionToken(uuidv4());
			Keyboard.dismiss();
			setIsSearchFocused(false);
			setIsSearching(false);
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
		const localityTerm =
			item.terms.length >= 3 ? item.terms[item.terms.length - 3] : null;
		const stateTerm =
			item.terms.length >= 2 ? item.terms[item.terms.length - 2] : null;

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
				<View style={styles.resultIconContainer}>
					<IconSymbol name="location" size={20} color={tintColor} />
				</View>
				<View style={styles.resultTextContainer}>
					<ThemedText style={styles.resultName}>
						{item.structured_formatting.main_text}
					</ThemedText>
					<ThemedText style={styles.resultAddress}>{secondLineText}</ThemedText>
				</View>
			</TouchableOpacity>
		);
	};

	const renderWasteItem = (
		type: (typeof WASTE_TYPES)[0],
		date: number | null,
	) => {
		const formattedDate = formatDate(date);
		const isToday = formattedDate === "Today";
		const isTomorrow = formattedDate === "Tomorrow";

		return (
			<View
				style={[
					styles.wasteCard,
					{
						backgroundColor: cardBgColor,
						borderColor: isToday || isTomorrow ? type.color : borderColor,
						borderWidth: isToday || isTomorrow ? 2 : 1,
					},
				]}
			>
				<View
					style={[styles.wasteIconContainer, { backgroundColor: type.bgColor }]}
				>
					<IconSymbol name={type.icon} size={24} color={type.color} />
				</View>
				<View style={styles.wasteContent}>
					<ThemedText style={styles.wasteType}>{type.name}</ThemedText>
					{isToday || isTomorrow ? (
						<View style={styles.wasteDateRow}>
							<View
								style={[styles.wasteBadge, { backgroundColor: type.color }]}
							>
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
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor }]}>
			<Pressable
				style={styles.container}
				onPress={() => {
					Keyboard.dismiss();
					setShowResults(false);
					setIsSearching(false);
				}}
				accessible={false}
			>
				<ThemedView style={styles.container}>
					{/* Header */}
					<View style={styles.header}>
						<ThemedText type="title" style={styles.title}>
							Bin Day
						</ThemedText>
						<ThemedText style={styles.subtitle}>
							Find your waste collection schedule
						</ThemedText>
					</View>

					{/* Search Bar and Results */}
					<Pressable
						style={styles.searchWrapper}
						onPress={() => {
							// Do nothing - just catch the tap
						}}
					>
						<View style={styles.searchInputWrapper}>
							<Pressable
								onPress={() => {
									inputRef.current?.focus();
								}}
							>
								<Animated.View
									style={[
										styles.searchContainer,
										{
											backgroundColor: cardBgColor,
											borderColor: animatedBorderColor,
											shadowColor: animatedBorderColor,
										},
									]}
								>
									<View style={styles.searchIcon}>
										<Animated.View
											style={{
												position: "absolute",
												opacity: inputFocusAnim.interpolate({
													inputRange: [0, 1],
													outputRange: [1, 0],
												}),
											}}
										>
											<IconSymbol
												name="magnifyingglass"
												size={20}
												color={`${textColor}60`}
											/>
										</Animated.View>
										<Animated.View
											style={{
												opacity: inputFocusAnim,
											}}
										>
											<IconSymbol
												name="magnifyingglass"
												size={20}
												color={tintColor}
											/>
										</Animated.View>
									</View>
									<TextInput
										ref={inputRef}
										style={[styles.searchInput, { color: textColor }]}
										placeholder="Search address or postcode"
										placeholderTextColor={`${textColor}40`}
										value={searchQuery}
										onChangeText={(text) => {
											setSearchQuery(text);
											searchForAddress(text);
										}}
										onFocus={() => {
											setIsSearchFocused(true);
											setIsSearching(true);
											if (searchResults.length > 0) {
												setShowResults(true);
											}
										}}
										onBlur={() => {
											setIsSearchFocused(false);
											// Don't end searching here - let selectAddress handle it
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
								</Animated.View>
							</Pressable>

							{/* Search Results Dropdown */}
							{searchResults.length > 0 && (
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
									pointerEvents={showResults ? "auto" : "none"}
								>
									<FlatList
										data={searchResults.slice(0, 3)}
										renderItem={renderSearchResult}
										keyExtractor={(item) => item.place_id}
										ItemSeparatorComponent={() => (
											<View
												style={[
													styles.separator,
													{ backgroundColor: borderColor },
												]}
											/>
										)}
									/>
								</Animated.View>
							)}
						</View>
					</Pressable>

					{/* Content Area - flex container for proper centering */}
					<Animated.View
						style={[
							{ flex: 1 },
							{
								opacity: emptyStateFadeAnim,
							},
						]}
						pointerEvents={isSearching ? "none" : "auto"}
					>
						{selectedAddress ? (
							<Animated.View
								style={[styles.contentArea, { opacity: fadeAnim }]}
							>
								{/* Address and Council Header */}
								<View style={styles.locationHeader}>
									<View style={styles.locationInfo}>
										{selectedPlaceDetails ? (
											(() => {
												const components =
													extractAddressComponents(selectedPlaceDetails);
												const streetAddress = components.subpremise
													? `${components.subpremise}/${components.streetNumber} ${components.route}`
													: `${components.streetNumber} ${components.route}`;
												const line1 = streetAddress.trim() || components.route;
												const line2 =
													`${components.locality} ${components.administrativeAreaLevel1} ${components.postalCode}`.trim();

												return (
													<>
														<ThemedText style={styles.addressLine1}>
															{line1}
														</ThemedText>
														<ThemedText style={styles.addressLine2}>
															{line2} • {selectedCouncil}
														</ThemedText>
													</>
												);
											})()
										) : (
											<>
												<ThemedText style={styles.addressLine1}>
													{selectedAddress}
												</ThemedText>
												{selectedCouncil && (
													<ThemedText style={styles.addressLine2}>
														{selectedCouncil}
													</ThemedText>
												)}
											</>
										)}
									</View>
									<Pressable
										onPress={clearSelectedAddress}
										style={styles.changeButton}
									>
										<IconSymbol
											name="xmark.circle.fill"
											size={24}
											color={`${textColor}40`}
										/>
									</Pressable>
								</View>

								{/* Waste Collection Info */}
								{selectedCouncil && (
									<View style={styles.wasteSection}>
										{isLoadingCouncilData ? (
											<View
												style={[
													styles.loadingCard,
													{ backgroundColor: cardBgColor },
												]}
											>
												<ThemedText style={styles.loadingText}>
													Loading collection dates...
												</ThemedText>
											</View>
										) : councilData?.supported && councilData?.result ? (
											<View style={styles.wasteGrid}>
												{WASTE_TYPES.map((type) => {
													const date = councilData.result?.[
														type.key as keyof typeof councilData.result
													] as number | null;
													if (type.key === "glass" && !date) return null;
													return renderWasteItem(type, date);
												})}
											</View>
										) : null}
									</View>
								)}

								{/* Unsupported Council */}
								{unsupportedCouncil && !selectedCouncil && (
									<UnsupportedCouncilCard
										councilName={unsupportedCouncil}
										backgroundColor={cardBgColor}
										borderColor={borderColor}
									/>
								)}
							</Animated.View>
						) : (
							/* Empty State */
							<View style={styles.emptyState}>
								<View
									style={[
										styles.emptyIconContainer,
										{ backgroundColor: `${tintColor}15` },
									]}
								>
									<IconSymbol
										name="magnifyingglass"
										size={48}
										color={tintColor}
									/>
								</View>
								<ThemedText style={styles.emptyTitle}>
									Search for your address
								</ThemedText>
								<ThemedText style={styles.emptyText}>
									Enter your street address to find your{"\n"}waste collection
									schedule
								</ThemedText>
							</View>
						)}
					</Animated.View>
				</ThemedView>
			</Pressable>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: Platform.OS === "android" ? 20 : 10,
		paddingBottom: 16,
	},
	title: {
		fontSize: 34,
		fontWeight: "700",
		marginBottom: 4,
		letterSpacing: -0.5,
	},
	subtitle: {
		fontSize: 16,
		opacity: 0.6,
	},
	searchWrapper: {
		paddingHorizontal: 20,
		marginBottom: 20,
		zIndex: 1000,
	},
	searchInputWrapper: {
		position: "relative",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.5,
		borderRadius: 16,
		paddingHorizontal: 16,
		height: 56,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 17,
		paddingVertical: 0,
		fontWeight: "400",
	},
	clearButton: {
		marginLeft: 8,
		padding: 4,
	},
	resultsContainer: {
		position: "absolute",
		top: 64,
		left: 0,
		right: 0,
		borderRadius: 16,
		borderWidth: 1,
		maxHeight: 240,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		overflow: "hidden",
	},
	resultItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	resultIconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#F2F2F7",
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
		marginBottom: 2,
	},
	resultAddress: {
		fontSize: 14,
		opacity: 0.6,
	},
	separator: {
		height: 0.5,
		marginLeft: 64,
	},
	contentArea: {
		flex: 1,
		paddingHorizontal: 20,
	},
	locationHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	locationInfo: {
		flex: 1,
		marginRight: 12,
	},
	changeButton: {
		padding: 4,
	},
	addressLine1: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 4,
	},
	addressLine2: {
		fontSize: 16,
		opacity: 0.7,
	},
	wasteSection: {
		marginTop: 8,
	},
	loadingCard: {
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
		opacity: 0.6,
	},
	wasteGrid: {
		gap: 12,
	},
	wasteCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 16,
		marginBottom: 8,
	},
	wasteIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
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
