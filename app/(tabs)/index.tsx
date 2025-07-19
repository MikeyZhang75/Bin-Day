// External package imports
import { useEffect, useRef } from "react";
import {
	Keyboard,
	Platform,
	Pressable,
	SafeAreaView,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import "react-native-get-random-values";
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
		animateSearchFocus,
		animateEmptyState,
		animateFadeIn,
		animateFadeOut,
	} = useAnimations();

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
		// Fade empty state when input is focused AND no address is selected
		console.log(
			"[EmptyState Animation] isFocused:",
			isFocused,
			"selectedAddress:",
			!!selectedAddress,
		);
		if (!selectedAddress) {
			console.log(
				"[EmptyState Animation] Calling animateEmptyState with:",
				!isFocused,
			);
			animateEmptyState(!isFocused);
		}
	}, [isFocused, selectedAddress, animateEmptyState]);

	useEffect(() => {
		animateSearchFocus(isFocused);
	}, [isFocused, animateSearchFocus]);

	useEffect(() => {
		console.log("[Fade Effect] selectedAddress changed:", !!selectedAddress);
		if (selectedAddress) {
			animateFadeIn();
		} else {
			animateFadeOut();
		}
	}, [selectedAddress, animateFadeIn, animateFadeOut]);

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
		// Only set focused to false if there's no text in the search
		if (searchQuery.length === 0) {
			setSearchFocused(false);
		}
	};

	const handleSearchClear = () => {
		clearSearch();
		inputRef.current?.focus();
		// Ensure focus is maintained after clearing
		setSearchFocused(true);
	};

	const handleAddressSelect = (prediction: GooglePrediction) => {
		selectAddress(prediction);
		inputRef.current?.blur();
	};

	const handleClearSelectedAddress = () => {
		console.log("[Clear Address] Clearing selected address");
		clearSelectedAddress();
		Keyboard.dismiss();
	};

	// Dismiss keyboard when tapping outside
	const handleOutsidePress = () => {
		Keyboard.dismiss();
		// Clear focus only if there's no text in the search
		if (searchQuery.length === 0) {
			setSearchFocused(false);
		}
	};

	return (
		<ErrorBoundary>
			<ThemedView style={[styles.container, { backgroundColor }]}>
				<SafeAreaView style={styles.safeArea}>
					<View style={styles.contentWrapper}>
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
					</View>
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
	mainContentPressable: {
		flex: 1,
	},
	mainContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: Platform.OS === "ios" ? 20 : 40,
		paddingBottom: 20,
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
		overflow: "hidden",
	},
	selectedContent: {
		gap: 16,
		paddingBottom: 20,
	},
	emptyStateWrapper: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
