import { useReducer } from "react";
import type { CouncilData } from "@/convex/councilServices";
import type {
	GooglePlaceDetails,
	GooglePrediction,
} from "@/types/googlePlaces";

// State shape
export interface AppState {
	search: {
		query: string;
		results: GooglePrediction[];
		isSearching: boolean;
		isFocused: boolean;
		showResults: boolean;
		sessionToken: string;
	};
	address: {
		selected: string | null;
		placeDetails: GooglePlaceDetails | null;
		council: string | null;
		unsupportedCouncil: string | null;
	};
	councilData: {
		isLoading: boolean;
		data: CouncilData | null;
		error: Error | null;
	};
}

// Action types
export type AppAction =
	| { type: "SET_SEARCH_QUERY"; payload: string }
	| { type: "SET_SEARCH_RESULTS"; payload: GooglePrediction[] }
	| { type: "SET_SEARCH_FOCUSED"; payload: boolean }
	| { type: "SET_SEARCHING"; payload: boolean }
	| { type: "SET_SHOW_RESULTS"; payload: boolean }
	| { type: "SET_SESSION_TOKEN"; payload: string }
	| {
			type: "SELECT_ADDRESS";
			payload: {
				address: string;
				placeDetails: GooglePlaceDetails | null;
				council: string | null;
				unsupportedCouncil: string | null;
			};
	  }
	| { type: "CLEAR_SEARCH" }
	| { type: "CLEAR_ADDRESS" }
	| { type: "SET_COUNCIL_LOADING"; payload: boolean }
	| { type: "SET_COUNCIL_DATA"; payload: CouncilData }
	| { type: "SET_COUNCIL_ERROR"; payload: Error }
	| { type: "CLEAR_COUNCIL_DATA" };

// Initial state
export const initialAppState: AppState = {
	search: {
		query: "",
		results: [],
		isSearching: false,
		isFocused: false,
		showResults: false,
		sessionToken: "",
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
};

// Reducer
export function appReducer(state: AppState, action: AppAction): AppState {
	switch (action.type) {
		// Search actions
		case "SET_SEARCH_QUERY":
			return {
				...state,
				search: {
					...state.search,
					query: action.payload,
				},
			};

		case "SET_SEARCH_RESULTS":
			return {
				...state,
				search: {
					...state.search,
					results: action.payload,
					showResults: action.payload.length > 0,
				},
			};

		case "SET_SEARCH_FOCUSED":
			return {
				...state,
				search: {
					...state.search,
					isFocused: action.payload,
				},
			};

		case "SET_SEARCHING":
			return {
				...state,
				search: {
					...state.search,
					isSearching: action.payload,
				},
			};

		case "SET_SHOW_RESULTS":
			return {
				...state,
				search: {
					...state.search,
					showResults: action.payload,
				},
			};

		case "SET_SESSION_TOKEN":
			return {
				...state,
				search: {
					...state.search,
					sessionToken: action.payload,
				},
			};

		case "CLEAR_SEARCH":
			return {
				...state,
				search: {
					...state.search,
					query: "",
					results: [],
					showResults: false,
				},
			};

		// Address actions
		case "SELECT_ADDRESS":
			return {
				...state,
				address: {
					selected: action.payload.address,
					placeDetails: action.payload.placeDetails,
					council: action.payload.council,
					unsupportedCouncil: action.payload.unsupportedCouncil,
				},
				search: {
					...state.search,
					query: "",
					results: [],
					showResults: false,
					isSearching: false,
					isFocused: false,
				},
			};

		case "CLEAR_ADDRESS":
			return {
				...state,
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
			};

		// Council data actions
		case "SET_COUNCIL_LOADING":
			return {
				...state,
				councilData: {
					...state.councilData,
					isLoading: action.payload,
					error: null,
				},
			};

		case "SET_COUNCIL_DATA":
			return {
				...state,
				councilData: {
					isLoading: false,
					data: action.payload,
					error: null,
				},
			};

		case "SET_COUNCIL_ERROR":
			return {
				...state,
				councilData: {
					isLoading: false,
					data: null,
					error: action.payload,
				},
			};

		case "CLEAR_COUNCIL_DATA":
			return {
				...state,
				councilData: {
					isLoading: false,
					data: null,
					error: null,
				},
			};

		default:
			return state;
	}
}

// Custom hook
export function useAppState(initialSessionToken: string) {
	const [state, dispatch] = useReducer(appReducer, {
		...initialAppState,
		search: {
			...initialAppState.search,
			sessionToken: initialSessionToken,
		},
	});

	return { state, dispatch };
}
