import { useMemo } from "react";
import type { WasteType } from "@/components/waste/WasteCard";

interface WasteItem {
	type: WasteType;
	date: number | null;
}

interface GroupedWasteItems {
	today: WasteItem[];
	upcoming: WasteItem[];
	future: WasteItem[];
}

export function useWasteSorting(
	wasteItems: (WasteItem | null)[],
): GroupedWasteItems {
	return useMemo(() => {
		// Filter and sort items
		const sortedItems = wasteItems
			.filter((item): item is WasteItem => item !== null)
			.sort((a, b) => {
				// Sort by date first (all items should have dates now)
				const dateDiff = (a.date || 0) - (b.date || 0);

				// If same date, sort alphabetically by name
				if (dateDiff === 0) {
					return a.type.name.localeCompare(b.type.name);
				}

				return dateDiff;
			});

		// Group by date
		if (sortedItems.length === 0) {
			return { today: [], upcoming: [], future: [] };
		}

		// Check if first group is today
		const now = new Date();
		const todayStart = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		).getTime();
		const todayEnd = todayStart + 24 * 60 * 60 * 1000;

		const todayItems: WasteItem[] = [];
		let remainingItems = sortedItems;

		// Extract today's items
		if (
			sortedItems[0].date &&
			sortedItems[0].date >= todayStart &&
			sortedItems[0].date < todayEnd
		) {
			const todayEndIndex = sortedItems.findIndex(
				(item) => !item.date || item.date < todayStart || item.date >= todayEnd,
			);

			if (todayEndIndex === -1) {
				// All items are today
				return { today: sortedItems, upcoming: [], future: [] };
			}

			todayItems.push(...sortedItems.slice(0, todayEndIndex));
			remainingItems = sortedItems.slice(todayEndIndex);
		}

		// If no remaining items after today
		if (remainingItems.length === 0) {
			return { today: todayItems, upcoming: [], future: [] };
		}

		// Find the next date group (upcoming)
		const firstRemainingDate = remainingItems[0].date;
		const upcomingEndIndex = remainingItems.findIndex(
			(item) => item.date !== firstRemainingDate,
		);

		if (upcomingEndIndex === -1) {
			// All remaining items have the same date
			return { today: todayItems, upcoming: remainingItems, future: [] };
		}

		return {
			today: todayItems,
			upcoming: remainingItems.slice(0, upcomingEndIndex),
			future: remainingItems.slice(upcomingEndIndex),
		};
	}, [wasteItems]);
}
