import { useAction } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { CouncilName } from "@/convex/councils";
import type { AppAction, AppState } from "./useAppState";

interface UseCouncilDataProps {
	state: AppState;
	dispatch: React.Dispatch<AppAction>;
}

export function useCouncilDataWithReducer({
	state,
	dispatch,
}: UseCouncilDataProps) {
	const getCouncilData = useAction(api.councilServices.getCouncilData);

	const { placeDetails, council: selectedCouncil } = state.address;

	useEffect(() => {
		if (selectedCouncil && placeDetails) {
			dispatch({ type: "SET_COUNCIL_LOADING", payload: true });

			getCouncilData({
				council: selectedCouncil as CouncilName,
				placeDetails: placeDetails,
			})
				.then((data) => {
					dispatch({ type: "SET_COUNCIL_DATA", payload: data });
				})
				.catch((error) => {
					console.error("Error fetching council data:", error);
					dispatch({ type: "SET_COUNCIL_ERROR", payload: error as Error });
				});
		} else {
			dispatch({ type: "CLEAR_COUNCIL_DATA" });
		}
	}, [selectedCouncil, placeDetails, getCouncilData, dispatch]);

	return {
		councilData: state.councilData.data,
		isLoadingCouncilData: state.councilData.isLoading,
		councilDataError: state.councilData.error,
	};
}
