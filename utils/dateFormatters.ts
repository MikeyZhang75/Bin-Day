export function formatDate(timestamp: number | null): string {
	if (!timestamp) return "N/A";
	const date = new Date(timestamp * 1000);
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	// Check if date is today
	if (date.toDateString() === today.toDateString()) {
		return "Today";
	}

	// Check if date is tomorrow
	if (date.toDateString() === tomorrow.toDateString()) {
		return "Tomorrow";
	}

	// Format as readable date
	return date.toLocaleDateString("en-AU", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
}
