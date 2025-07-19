// External package imports
import { useEffect, useRef } from "react";
import {
	Keyboard,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import "react-native-get-random-values";
import { BlurView } from "expo-blur";
import { v4 as uuidv4 } from "uuid";
import { AddressDisplay } from "@/components/address/AddressDisplay";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
// Internal imports
import { ThemedView } from "@/components/ThemedView";
import { UnsupportedCouncilCard } from "@/components/UnsupportedCouncilCard";
import { WasteCollectionGrid } from "@/components/waste/WasteCollectionGrid";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useAnimations } from "@/hooks/useAnimations";
import { useCouncilData } from "@/hooks/useCouncilData";
import { useThemeColor } from "@/hooks/useThemeColor";
import { searchSelectors, useAppStore } from "@/stores/appStore";
import type { GooglePrediction } from "@/types/googlePlaces";

export default function HomeScreen() {
	const inputRef = useRef<TextInput>(null);

	// Initialize session token
	useEffect(() => {
		useAppStore.getState().setSessionToken(uuidv4());
	}, []);

	// Store selectors - using performance-optimized selectors
	const searchQuery = useAppStore((state) => state.search.query);
	const searchResults = useAppStore((state) => state.search.results);
	const isFocused = useAppStore((state) => state.search.isFocused);
	const isDropdownVisible = useAppStore(searchSelectors.isDropdownVisible);
	const searchError = useAppStore((state) => state.search.error);
	const selectedAddress = useAppStore((state) => state.address.selected);
	const placeDetails = useAppStore((state) => state.address.placeDetails);
	const council = useAppStore((state) => state.address.council);
	const unsupportedCouncil = useAppStore(
		(state) => state.address.unsupportedCouncil,
	);

	// Theme colors
	const backgroundColor = useThemeColor({}, "background");
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);
	const colorScheme =
		useThemeColor({}, "background") === "#000000" ? "dark" : "light";

	// Custom hooks
	const {
		searchForAddress,
		selectAddress,
		clearSearch,
		clearSelectedAddress,
		setSearchFocused,
	} = useAddressSearch();

	const { councilData, isLoadingCouncilData } = useCouncilData();

	// Animations
	const {
		fadeAnim,
		emptyStateFadeAnim,
		inputFocusAnim,
		blurOpacityAnim,
		shouldRenderBlur,
		animateSearchFocus,
		animateEmptyState,
		animateFadeIn,
		animateBlur,
	} = useAnimations();

	// Animated styles
	const blurAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: blurOpacityAnim.value,
		};
	});

	const selectedContentAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: fadeAnim.value,
		};
	});

	const emptyStateAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: emptyStateFadeAnim.value,
		};
	});

	// Effects

	useEffect(() => {
		animateEmptyState(!searchQuery);
	}, [searchQuery, animateEmptyState]);

	useEffect(() => {
		animateSearchFocus(isFocused);
		// Animate blur with dropdown visibility
		animateBlur(isFocused, isDropdownVisible);
	}, [isFocused, isDropdownVisible, animateSearchFocus, animateBlur]);

	useEffect(() => {
		if (selectedAddress) {
			animateFadeIn();
		}
	}, [selectedAddress, animateFadeIn]);

	// Cleanup search results on unmount
	useEffect(() => {
		return () => {
			// Clear search results immediately on unmount to free memory
			clearSearch();
		};
	}, [clearSearch]);

	// Search handlers
	const handleSearchQueryChange = (text: string) => {
		searchForAddress(text);
	};

	const handleSearchFocus = () => {
		setSearchFocused(true);
	};

	const handleSearchBlur = () => {
		setSearchFocused(false);
	};

	const handleSearchClear = () => {
		clearSearch();
		inputRef.current?.focus();
	};

	const handleAddressSelect = (prediction: GooglePrediction) => {
		selectAddress(prediction);
		inputRef.current?.blur();
	};

	const handleClearSelectedAddress = () => {
		clearSelectedAddress();
		Keyboard.dismiss();
	};

	// Dismiss keyboard when tapping outside
	const handleOutsidePress = () => {
		Keyboard.dismiss();
	};

	return (
		<ErrorBoundary>
			<ThemedView style={[styles.container, { backgroundColor }]}>
				<SafeAreaView style={styles.safeArea}>
					<ScrollView
						style={styles.contentWrapper}
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Pressable
							style={styles.mainContentPressable}
							onPress={handleOutsidePress}
							accessible={false}
						>
							{/* Main Content */}
							<View style={styles.mainContent}>
								{/* Search Wrapper for proper z-index handling */}
								{!selectedAddress && (
									<View style={styles.searchWrapper}>
										<Pressable onPress={(e) => e.stopPropagation()}>
											<View style={styles.searchSection}>
												<SearchBar
													inputRef={inputRef}
													searchQuery={searchQuery}
													onSearchQueryChange={handleSearchQueryChange}
													onFocus={handleSearchFocus}
													onBlur={handleSearchBlur}
													onClear={handleSearchClear}
													inputFocusAnim={inputFocusAnim}
												/>

												{/* Search Results Dropdown - Using computed visibility */}
												{isDropdownVisible && (
													<SearchResults
														key="search-results"
														searchResults={searchResults}
														onSelectAddress={handleAddressSelect}
													/>
												)}

												{/* Error Message */}
												{searchError && (
													<ErrorMessage
														message={searchError}
														onRetry={() => searchForAddress(searchQuery)}
													/>
												)}
											</View>
										</Pressable>
									</View>
								)}

								{/* Content Area */}
								<View style={styles.contentContainer}>
									{/* Blur overlay with proper exit animation */}
									{shouldRenderBlur && (
										<Animated.View
											style={[
												styles.blurOverlay,
												{
													pointerEvents: "none",
												},
												blurAnimatedStyle,
											]}
										>
											{Platform.OS === "ios" ? (
												<BlurView
													intensity={12}
													tint={colorScheme}
													style={StyleSheet.absoluteFillObject}
												/>
											) : (
												<View
													style={[
														StyleSheet.absoluteFillObject,
														{ backgroundColor: "rgba(0,0,0,0.06)" },
													]}
												/>
											)}
										</Animated.View>
									)}

									{selectedAddress ? (
										<Animated.View
											style={[
												styles.selectedContent,
												selectedContentAnimatedStyle,
											]}
										>
											{/* Selected Address Display */}
											<AddressDisplay
												selectedAddress={selectedAddress}
												selectedPlaceDetails={placeDetails}
												selectedCouncil={council}
												onClear={handleClearSelectedAddress}
											/>

											{/* Unsupported Council Message */}
											{unsupportedCouncil && (
												<UnsupportedCouncilCard
													councilName={unsupportedCouncil}
													backgroundColor={cardBgColor}
													borderColor={borderColor}
												/>
											)}

											{/* Waste Collection Grid */}
											{council && (
												<WasteCollectionGrid
													councilData={councilData}
													isLoadingCouncilData={isLoadingCouncilData}
												/>
											)}
										</Animated.View>
									) : (
										<Animated.View
											style={[
												styles.emptyStateWrapper,
												emptyStateAnimatedStyle,
											]}
										>
											<EmptyState />
										</Animated.View>
									)}
								</View>
							</View>
						</Pressable>
					</ScrollView>
				</SafeAreaView>
			</ThemedView>
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	contentWrapper: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	mainContentPressable: {
		flex: 1,
	},
	mainContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: Platform.OS === "ios" ? 20 : 40,
		paddingBottom: 100,
	},
	searchWrapper: {
		zIndex: 100,
		marginBottom: 20,
	},
	searchSection: {
		position: "relative",
	},
	contentContainer: {
		flex: 1,
		position: "relative",
	},
	blurOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
	},
	selectedContent: {
		gap: 16,
	},
	emptyStateWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
