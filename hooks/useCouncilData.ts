import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { CouncilData } from "@/convex/councilServices";
import type { CouncilName } from "@/convex/councils";
import type { GooglePlaceDetails } from "@/types/googlePlaces";

export function useCouncilData(
	selectedCouncil: string | null,
	selectedPlaceDetails: GooglePlaceDetails | null,
) {
	const [councilData, setCouncilData] = useState<CouncilData | null>(null);
	const [isLoadingCouncilData, setIsLoadingCouncilData] = useState(false);

	const getCouncilData = useAction(api.councilServices.getCouncilData);

	useEffect(() => {
		if (selectedCouncil && selectedPlaceDetails) {
			setIsLoadingCouncilData(true);
			getCouncilData({
				council: selectedCouncil as CouncilName,
				placeDetails: selectedPlaceDetails,
			})
				.then((data) => {
					setCouncilData(data);
					setIsLoadingCouncilData(false);
				})
				.catch((error) => {
					console.error("Error fetching council data:", error);
					setCouncilData(null);
					setIsLoadingCouncilData(false);
				});
		} else {
			setCouncilData(null);
		}
	}, [selectedCouncil, selectedPlaceDetails, getCouncilData]);

	return {
		councilData,
		isLoadingCouncilData,
	};
}
