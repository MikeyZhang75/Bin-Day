import { useAction } from "convex/react";
import { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/convex/_generated/api";
import { isValidCouncilName } from "@/convex/councils";
import { extractAddressComponents } from "@/lib/addressExtractor";
import type {
	GooglePlaceDetails,
	GooglePrediction,
} from "@/types/googlePlaces";

export function useAddressSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<GooglePrediction[]>([]);
	const [showResults, setShowResults] = useState(false);
	const [sessionToken, setSessionToken] = useState(uuidv4());
	const [isSearching, setIsSearching] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	// Selected address state
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [selectedPlaceDetails, setSelectedPlaceDetails] =
		useState<GooglePlaceDetails | null>(null);
	const [selectedCouncil, setSelectedCouncil] = useState<string | null>(null);
	const [unsupportedCouncil, setUnsupportedCouncil] = useState<string | null>(
		null,
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

				if (response.predictions.length > 0) {
					setSearchResults(response.predictions);
					setShowResults(true);
				} else {
					setSearchResults([]);
					setShowResults(false);
				}
			} catch (error) {
				console.error("Autocomplete error:", error);
				setSearchResults([]);
				setShowResults(false);
			}
		},
		[sessionToken, autocomplete],
	);

	const selectAddress = async (prediction: GooglePrediction) => {
		// Immediately hide dropdown and keyboard
		setShowResults(false);
		setIsSearching(false);
		Keyboard.dismiss();

		try {
			const response = await placeDetails({
				placeId: prediction.place_id,
				sessionToken,
			});

			if (response.result) {
				setSelectedAddress(response.result.formatted_address);
				setSelectedPlaceDetails(response.result);

				const components = extractAddressComponents(response.result);
				
				// First check if administrativeAreaLevel2 is a valid council
				if (components.administrativeAreaLevel2 && isValidCouncilName(components.administrativeAreaLevel2)) {
					setSelectedCouncil(components.administrativeAreaLevel2);
					setUnsupportedCouncil(null);
				} 
				// Then check if locality is a valid council (for councils that might be stored differently)
				else if (components.locality && isValidCouncilName(components.locality)) {
					setSelectedCouncil(components.locality);
					setUnsupportedCouncil(null);
				} 
				// If neither is a valid council, mark as unsupported
				else if (components.administrativeAreaLevel2) {
					setUnsupportedCouncil(components.administrativeAreaLevel2);
					setSelectedCouncil(null);
				} else if (components.locality) {
					setUnsupportedCouncil(components.locality);
					setSelectedCouncil(null);
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
			setSessionToken(uuidv4());
			setIsSearchFocused(false);
		} catch (error) {
			console.error("Error retrieving full address:", error);
			setSelectedAddress(prediction.description);
			setSelectedPlaceDetails(null);
			setSelectedCouncil(null);
			setUnsupportedCouncil(null);
			setSearchResults([]);
			setSearchQuery("");
			setSessionToken(uuidv4());
			setIsSearchFocused(false);
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
	};

	return {
		// Search state
		searchQuery,
		setSearchQuery,
		searchResults,
		showResults,
		setShowResults,
		isSearching,
		setIsSearching,
		isSearchFocused,
		setIsSearchFocused,
		// Selected address state
		selectedAddress,
		selectedPlaceDetails,
		selectedCouncil,
		unsupportedCouncil,
		// Functions
		searchForAddress,
		selectAddress,
		clearSearch,
		clearSelectedAddress,
	};
}
