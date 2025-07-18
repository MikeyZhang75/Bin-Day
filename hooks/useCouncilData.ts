import { useAction } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { CouncilName } from "@/convex/councils";
import { useAppStore } from "@/stores/appStore";

export function useCouncilData() {
	const getCouncilData = useAction(api.councilServices.getCouncilData);

	// Store
	const placeDetails = useAppStore((state) => state.address.placeDetails);
	const council = useAppStore((state) => state.address.council);
	const councilData = useAppStore((state) => state.councilData.data);
	const isLoadingCouncilData = useAppStore(
		(state) => state.councilData.isLoading,
	);
	const setCouncilLoading = useAppStore((state) => state.setCouncilLoading);
	const setCouncilData = useAppStore((state) => state.setCouncilData);
	const setCouncilError = useAppStore((state) => state.setCouncilError);
	const clearCouncilData = useAppStore((state) => state.clearCouncilData);

	const fetchCouncilData = useCallback(async () => {
		if (!placeDetails || !council) {
			clearCouncilData();
			return;
		}

		setCouncilLoading(true);

		try {
			const data = await getCouncilData({
				placeDetails,
				council: council as CouncilName,
			});

			setCouncilData(data);
		} catch (error) {
			console.error("Failed to get council data:", error);
			setCouncilError(
				error instanceof Error
					? error
					: new Error("Failed to get council data"),
			);
		}
	}, [
		placeDetails,
		council,
		getCouncilData,
		setCouncilLoading,
		setCouncilData,
		setCouncilError,
		clearCouncilData,
	]);

	// Fetch council data when placeDetails or council changes
	useEffect(() => {
		fetchCouncilData();
	}, [fetchCouncilData]);

	return {
		councilData,
		isLoadingCouncilData,
	};
}
