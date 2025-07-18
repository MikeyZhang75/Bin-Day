import { useMemo } from "react";
import type { WasteType } from "@/components/waste/WasteCard";
import { formatDate } from "@/utils/dateFormatters";

interface WasteItem {
	type: WasteType;
	date: number | null;
}

export function useWasteSorting(wasteItems: (WasteItem | null)[]) {
	return useMemo(() => {
		return wasteItems
			.filter((item): item is WasteItem => item !== null)
			.sort((a, b) => {
				const aDate = formatDate(a.date);
				const bDate = formatDate(b.date);
				const aIsToday = aDate === "Today";
				const bIsToday = bDate === "Today";

				// Today's bins first
				if (aIsToday && !bIsToday) return -1;
				if (!aIsToday && bIsToday) return 1;

				// Then tomorrow's bins
				const aIsTomorrow = aDate === "Tomorrow";
				const bIsTomorrow = bDate === "Tomorrow";

				if (aIsTomorrow && !bIsTomorrow) return -1;
				if (!aIsTomorrow && bIsTomorrow) return 1;

				// Then sort by date
				const dateDiff = (a.date || 0) - (b.date || 0);

				// If same date, sort alphabetically by name
				if (dateDiff === 0) {
					return a.type.name.localeCompare(b.type.name);
				}

				return dateDiff;
			});
	}, [wasteItems]);
}
