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
	isFocused: boolean;
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
				isFocused: false,
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
					},
				})),

			setSearchFocused: (isFocused) =>
				set((state) => ({
					search: { ...state.search, isFocused },
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

// Performance-optimized selectors
export const searchSelectors = {
	query: (state: AppStore) => state.search.query,
	results: (state: AppStore) => state.search.results,
	isFocused: (state: AppStore) => state.search.isFocused,
	error: (state: AppStore) => state.search.error,
	sessionToken: (state: AppStore) => state.search.sessionToken,
	// Computed selector for dropdown visibility
	isDropdownVisible: (state: AppStore) =>
		state.search.isFocused && state.search.results.length > 0,
};

export const addressSelectors = {
	selected: (state: AppStore) => state.address.selected,
	placeDetails: (state: AppStore) => state.address.placeDetails,
	council: (state: AppStore) => state.address.council,
	unsupportedCouncil: (state: AppStore) => state.address.unsupportedCouncil,
};

export const councilDataSelectors = {
	data: (state: AppStore) => state.councilData.data,
	isLoading: (state: AppStore) => state.councilData.isLoading,
	error: (state: AppStore) => state.councilData.error,
};

// Legacy selectors for backward compatibility
export const useSearchQuery = () => useAppStore(searchSelectors.query);
export const useSearchResults = () => useAppStore(searchSelectors.results);
export const useSelectedAddress = () => useAppStore(addressSelectors.selected);
export const useCouncilData = () => useAppStore(councilDataSelectors.data);
export const useIsLoadingCouncilData = () =>
	useAppStore(councilDataSelectors.isLoading);
