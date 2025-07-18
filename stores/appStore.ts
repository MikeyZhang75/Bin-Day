import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CouncilData } from "@/convex/councilServices";
import type {
	GooglePlaceDetails,
	GooglePrediction,
} from "@/types/googlePlaces";

interface SearchState {
	query: string;
	results: GooglePrediction[];
	isSearching: boolean;
	isFocused: boolean;
	showResults: boolean;
	sessionToken: string;
	error: string | null;
}

interface AddressState {
	selected: string | null;
	placeDetails: GooglePlaceDetails | null;
	council: string | null;
	unsupportedCouncil: string | null;
}

interface CouncilDataState {
	isLoading: boolean;
	data: CouncilData | null;
	error: Error | null;
}

interface AppState {
	search: SearchState;
	address: AddressState;
	councilData: CouncilDataState;
}

interface AppActions {
	// Search actions
	setSearchQuery: (query: string) => void;
	setSearchResults: (results: GooglePrediction[]) => void;
	setSearchFocused: (focused: boolean) => void;
	setSearching: (searching: boolean) => void;
	setShowResults: (show: boolean) => void;
	setSessionToken: (token: string) => void;
	setSearchError: (error: string | null) => void;
	clearSearch: () => void;

	// Address actions
	selectAddress: (payload: {
		address: string;
		placeDetails: GooglePlaceDetails | null;
		council: string | null;
		unsupportedCouncil: string | null;
	}) => void;
	clearAddress: () => void;

	// Council data actions
	setCouncilLoading: (loading: boolean) => void;
	setCouncilData: (data: CouncilData) => void;
	setCouncilError: (error: Error) => void;
	clearCouncilData: () => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
	devtools(
		(set) => ({
			// Initial state
			search: {
				query: "",
				results: [],
				isSearching: false,
				isFocused: false,
				showResults: false,
				sessionToken: "",
				error: null,
			},
			address: {
				selected: null,
				placeDetails: null,
				council: null,
				unsupportedCouncil: null,
			},
			councilData: {
				isLoading: false,
				data: null,
				error: null,
			},

			// Search actions
			setSearchQuery: (query) =>
				set((state) => ({
					search: { ...state.search, query },
				})),

			setSearchResults: (results) =>
				set((state) => ({
					search: {
						...state.search,
						results,
						showResults: results.length > 0 && !state.address.selected,
					},
				})),

			setSearchFocused: (isFocused) =>
				set((state) => ({
					search: { ...state.search, isFocused },
				})),

			setSearching: (isSearching) =>
				set((state) => ({
					search: { ...state.search, isSearching },
				})),

			setShowResults: (showResults) =>
				set((state) => ({
					search: { ...state.search, showResults },
				})),

			setSessionToken: (sessionToken) =>
				set((state) => ({
					search: { ...state.search, sessionToken },
				})),

			setSearchError: (error) =>
				set((state) => ({
					search: { ...state.search, error },
				})),

			clearSearch: () =>
				set((state) => ({
					search: {
						...state.search,
						query: "",
						results: [],
						showResults: false,
						error: null,
					},
				})),

			// Address actions
			selectAddress: (payload) =>
				set((state) => ({
					address: {
						selected: payload.address,
						placeDetails: payload.placeDetails,
						council: payload.council,
						unsupportedCouncil: payload.unsupportedCouncil,
					},
					search: {
						...state.search,
						query: "",
						results: [],
						showResults: false,
						isSearching: false,
						isFocused: false,
					},
				})),

			clearAddress: () =>
				set(() => ({
					address: {
						selected: null,
						placeDetails: null,
						council: null,
						unsupportedCouncil: null,
					},
					councilData: {
						isLoading: false,
						data: null,
						error: null,
					},
				})),

			// Council data actions
			setCouncilLoading: (isLoading) =>
				set((state) => ({
					councilData: {
						...state.councilData,
						isLoading,
						error: null,
					},
				})),

			setCouncilData: (data) =>
				set(() => ({
					councilData: {
						isLoading: false,
						data,
						error: null,
					},
				})),

			setCouncilError: (error) =>
				set(() => ({
					councilData: {
						isLoading: false,
						data: null,
						error,
					},
				})),

			clearCouncilData: () =>
				set(() => ({
					councilData: {
						isLoading: false,
						data: null,
						error: null,
					},
				})),
		}),
		{
			name: "app-store",
		},
	),
);

// Selectors for common use cases
export const useSearchQuery = () => useAppStore((state) => state.search.query);
export const useSearchResults = () =>
	useAppStore((state) => state.search.results);
export const useSelectedAddress = () =>
	useAppStore((state) => state.address.selected);
export const useCouncilData = () =>
	useAppStore((state) => state.councilData.data);
export const useIsLoadingCouncilData = () =>
	useAppStore((state) => state.councilData.isLoading);
