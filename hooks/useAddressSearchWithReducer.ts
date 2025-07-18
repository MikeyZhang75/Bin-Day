import { useAction } from "convex/react";
import { useCallback } from "react";
import { Keyboard } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/convex/_generated/api";
import { isValidCouncilName } from "@/convex/councils";
import { extractAddressComponents } from "@/lib/addressExtractor";
import type { GooglePrediction } from "@/types/googlePlaces";
import type { AppAction, AppState } from "./useAppState";

interface UseAddressSearchProps {
	state: AppState;
	dispatch: React.Dispatch<AppAction>;
}

export function useAddressSearchWithReducer({
	state,
	dispatch,
}: UseAddressSearchProps) {
	// Convex actions
	const autocomplete = useAction(api.googlePlaces.autocomplete);
	const placeDetails = useAction(api.googlePlaces.placeDetails);

	const searchForAddress = useCallback(
		async (query: string) => {
			dispatch({ type: "SET_SEARCH_QUERY", payload: query });

			if (query.length < 3) {
				dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
				return;
			}

			try {
				const response = await autocomplete({
					input: query,
					sessionToken: state.search.sessionToken,
				});

				dispatch({ type: "SET_SEARCH_RESULTS", payload: response.predictions });
			} catch (error) {
				console.error("Autocomplete error:", error);
				dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
			}
		},
		[state.search.sessionToken, autocomplete, dispatch],
	);

	const selectAddress = useCallback(
		async (prediction: GooglePrediction) => {
			// Immediately hide dropdown and keyboard
			dispatch({ type: "SET_SHOW_RESULTS", payload: false });
			dispatch({ type: "SET_SEARCHING", payload: false });
			Keyboard.dismiss();

			try {
				const response = await placeDetails({
					placeId: prediction.place_id,
					sessionToken: state.search.sessionToken,
				});

				let council = null;
				let unsupportedCouncil = null;

				if (response.result) {
					const components = extractAddressComponents(response.result);
					
					// First check if administrativeAreaLevel2 is a valid council
					if (components.administrativeAreaLevel2 && isValidCouncilName(components.administrativeAreaLevel2)) {
						council = components.administrativeAreaLevel2;
					} 
					// Then check if locality is a valid council (for councils that might be stored differently)
					else if (components.locality && isValidCouncilName(components.locality)) {
						council = components.locality;
					} 
					// If neither is a valid council, mark as unsupported
					else if (components.administrativeAreaLevel2) {
						unsupportedCouncil = components.administrativeAreaLevel2;
					} else if (components.locality) {
						unsupportedCouncil = components.locality;
					}
				}

				dispatch({
					type: "SELECT_ADDRESS",
					payload: {
						address:
							response.result?.formatted_address || prediction.description,
						placeDetails: response.result || null,
						council,
						unsupportedCouncil,
					},
				});

				// Generate new session token
				dispatch({ type: "SET_SESSION_TOKEN", payload: uuidv4() });
			} catch (error) {
				console.error("Error retrieving full address:", error);

				dispatch({
					type: "SELECT_ADDRESS",
					payload: {
						address: prediction.description,
						placeDetails: null,
						council: null,
						unsupportedCouncil: null,
					},
				});

				dispatch({ type: "SET_SESSION_TOKEN", payload: uuidv4() });
			}
		},
		[state.search.sessionToken, placeDetails, dispatch],
	);

	const clearSearch = useCallback(() => {
		dispatch({ type: "CLEAR_SEARCH" });
	}, [dispatch]);

	const clearSelectedAddress = useCallback(() => {
		dispatch({ type: "CLEAR_ADDRESS" });
	}, [dispatch]);

	const setSearchFocused = useCallback(
		(focused: boolean) => {
			dispatch({ type: "SET_SEARCH_FOCUSED", payload: focused });
		},
		[dispatch],
	);

	const setSearching = useCallback(
		(searching: boolean) => {
			dispatch({ type: "SET_SEARCHING", payload: searching });
		},
		[dispatch],
	);

	const setShowResults = useCallback(
		(show: boolean) => {
			dispatch({ type: "SET_SHOW_RESULTS", payload: show });
		},
		[dispatch],
	);

	return {
		// Functions
		searchForAddress,
		selectAddress,
		clearSearch,
		clearSelectedAddress,
		setSearchFocused,
		setSearching,
		setShowResults,
	};
}
