import { useAction } from "convex/react";
import { useCallback, useRef } from "react";
import { Keyboard } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/convex/_generated/api";
import { isValidCouncilName } from "@/convex/councils";
import { extractAddressComponents } from "@/lib/addressExtractor";
import { useAppStore } from "@/stores/appStore";
import type { GooglePrediction } from "@/types/googlePlaces";

export function useAddressSearchZustand() {
	// Convex actions
	const autocomplete = useAction(api.googlePlaces.autocomplete);
	const placeDetails = useAction(api.googlePlaces.placeDetails);

	// Zustand store
	const sessionToken = useAppStore((state) => state.search.sessionToken);
	const setSearchQuery = useAppStore((state) => state.setSearchQuery);
	const setSearchResults = useAppStore((state) => state.setSearchResults);
	const setShowResults = useAppStore((state) => state.setShowResults);
	const setSearching = useAppStore((state) => state.setSearching);
	const setSessionToken = useAppStore((state) => state.setSessionToken);
	const selectAddressAction = useAppStore((state) => state.selectAddress);
	const clearSearchAction = useAppStore((state) => state.clearSearch);
	const clearAddressAction = useAppStore((state) => state.clearAddress);
	const setSearchFocused = useAppStore((state) => state.setSearchFocused);
	const setSearchError = useAppStore((state) => state.setSearchError);

	// Debounce timer ref
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const searchForAddress = useCallback(
		async (query: string) => {
			setSearchQuery(query);

			if (query.length < 3) {
				setSearchResults([]);
				return;
			}

			// Clear previous timeout
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			// Set new timeout for debounced search
			debounceRef.current = setTimeout(async () => {
				try {
					setSearchError(null); // Clear any previous errors
					const response = await autocomplete({
						input: query,
						sessionToken,
					});

					setSearchResults(response.predictions);
				} catch (error) {
					console.error("Autocomplete error:", error);
					setSearchResults([]);
					setSearchError(
						"Unable to search addresses. Please check your connection and try again.",
					);
				}
			}, 300);
		},
		[
			sessionToken,
			autocomplete,
			setSearchQuery,
			setSearchResults,
			setSearchError,
		],
	);

	const selectAddress = useCallback(
		async (prediction: GooglePrediction) => {
			// Immediately hide dropdown and keyboard
			setShowResults(false);
			setSearching(false);
			setSearchResults([]); // Clear results to prevent race condition
			Keyboard.dismiss();

			try {
				const response = await placeDetails({
					placeId: prediction.place_id,
					sessionToken,
				});

				let council = null;
				let unsupportedCouncil = null;

				if (response.result) {
					const components = extractAddressComponents(response.result);

					// First check if administrativeAreaLevel2 is a valid council
					if (
						components.administrativeAreaLevel2 &&
						isValidCouncilName(components.administrativeAreaLevel2)
					) {
						council = components.administrativeAreaLevel2;
					}
					// Then check if locality is a valid council (for councils that might be stored differently)
					else if (
						components.locality &&
						isValidCouncilName(components.locality)
					) {
						council = components.locality;
					}
					// If neither is a valid council, mark as unsupported
					else if (components.administrativeAreaLevel2) {
						unsupportedCouncil = components.administrativeAreaLevel2;
					} else if (components.locality) {
						unsupportedCouncil = components.locality;
					}
				}

				selectAddressAction({
					address: response.result?.formatted_address || prediction.description,
					placeDetails: response.result || null,
					council,
					unsupportedCouncil,
				});

				// Generate new session token
				setSessionToken(uuidv4());
			} catch (error) {
				console.error("Error retrieving full address:", error);

				selectAddressAction({
					address: prediction.description,
					placeDetails: null,
					council: null,
					unsupportedCouncil: null,
				});

				setSessionToken(uuidv4());
			}
		},
		[
			sessionToken,
			placeDetails,
			setShowResults,
			setSearching,
			setSearchResults,
			selectAddressAction,
			setSessionToken,
		],
	);

	return {
		// Functions
		searchForAddress,
		selectAddress,
		clearSearch: clearSearchAction,
		clearSelectedAddress: clearAddressAction,
		setSearchFocused,
		setSearching,
		setShowResults,
	};
}
