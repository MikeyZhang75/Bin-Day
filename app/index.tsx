// External package imports
import { useEffect, useRef } from "react";
import {
	Animated,
	Keyboard,
	Platform,
	Pressable,
	SafeAreaView,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { AddressDisplay } from "@/components/address/AddressDisplay";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
// Internal imports
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UnsupportedCouncilCard } from "@/components/UnsupportedCouncilCard";
import { WasteCollectionGrid } from "@/components/waste/WasteCollectionGrid";
import { useAddressSearchWithReducer } from "@/hooks/useAddressSearchWithReducer";
import { useAnimations } from "@/hooks/useAnimations";
import { useAppState } from "@/hooks/useAppState";
import { useCouncilDataWithReducer } from "@/hooks/useCouncilDataWithReducer";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function HomeScreen() {
	const inputRef = useRef<TextInput>(null);

	// Initialize state with reducer
	const { state, dispatch } = useAppState(uuidv4());

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

	// Custom hooks with reducer
	const {
		searchForAddress,
		selectAddress,
		clearSearch,
		clearSelectedAddress,
		setSearchFocused,
		setSearching,
		setShowResults,
	} = useAddressSearchWithReducer({ state, dispatch });

	const { councilData, isLoadingCouncilData } = useCouncilDataWithReducer({
		state,
		dispatch,
	});

	// Animations
	const {
		fadeAnim,
		emptyStateFadeAnim,
		resultsOpacityAnim,
		resultsScaleAnim,
		inputFocusAnim,
		animateSearchFocus,
		animateResults,
		animateEmptyState,
		animateFadeIn,
	} = useAnimations();

	// Effects
	useEffect(() => {
		animateResults(state.search.showResults);
	}, [state.search.showResults, animateResults]);

	useEffect(() => {
		animateEmptyState(!state.search.isSearching);
	}, [state.search.isSearching, animateEmptyState]);

	useEffect(() => {
		animateSearchFocus(state.search.isFocused);
	}, [state.search.isFocused, animateSearchFocus]);

	useEffect(() => {
		if (state.address.selected) {
			animateFadeIn();
		}
	}, [state.address.selected, animateFadeIn]);

	// Search handlers
	const handleSearchQueryChange = (text: string) => {
		searchForAddress(text);
	};

	const handleSearchFocus = () => {
		setSearchFocused(true);
		setSearching(true);
		if (state.search.results.length > 0) {
			setShowResults(true);
		}
	};

	const handleSearchBlur = () => {
		setSearchFocused(false);
	};

	const handleClearAddress = () => {
		clearSelectedAddress();
		inputRef.current?.focus();
	};

	return (
		<ErrorBoundary>
			<SafeAreaView style={[styles.container, { backgroundColor }]}>
				<Pressable
					style={styles.container}
					onPress={() => {
						Keyboard.dismiss();
						setShowResults(false);
						setSearching(false);
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
								// Prevent propagation
							}}
						>
							<View style={styles.searchInputWrapper}>
								<SearchBar
									searchQuery={state.search.query}
									onSearchQueryChange={handleSearchQueryChange}
									onFocus={handleSearchFocus}
									onBlur={handleSearchBlur}
									onClear={clearSearch}
									inputRef={inputRef}
									inputFocusAnim={inputFocusAnim}
								/>

								<SearchResults
									searchResults={state.search.results}
									showResults={state.search.showResults}
									onSelectAddress={selectAddress}
									resultsOpacityAnim={resultsOpacityAnim}
									resultsScaleAnim={resultsScaleAnim}
								/>
							</View>
						</Pressable>

						{/* Content Area */}
						<Animated.View
							style={[
								{ flex: 1 },
								{
									opacity: emptyStateFadeAnim,
								},
							]}
							pointerEvents={state.search.isSearching ? "none" : "auto"}
						>
							{state.address.selected ? (
								<Animated.View
									style={[styles.contentArea, { opacity: fadeAnim }]}
								>
									<AddressDisplay
										selectedAddress={state.address.selected}
										selectedPlaceDetails={state.address.placeDetails}
										selectedCouncil={state.address.council}
										onClear={handleClearAddress}
									/>

									{/* Waste Collection Info */}
									{state.address.council && (
										<View style={styles.wasteSection}>
											<WasteCollectionGrid
												councilData={councilData}
												isLoadingCouncilData={isLoadingCouncilData}
											/>
										</View>
									)}

									{/* Unsupported Council */}
									{state.address.unsupportedCouncil &&
										!state.address.council && (
											<UnsupportedCouncilCard
												councilName={state.address.unsupportedCouncil}
												backgroundColor={cardBgColor}
												borderColor={borderColor}
											/>
										)}
								</Animated.View>
							) : (
								<EmptyState />
							)}
						</Animated.View>
					</ThemedView>
				</Pressable>
			</SafeAreaView>
		</ErrorBoundary>
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
	contentArea: {
		flex: 1,
	},
	wasteSection: {
		paddingHorizontal: 20,
		flex: 1,
	},
});
