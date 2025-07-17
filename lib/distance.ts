/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;

	return distance;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Calculate the distance between two geographic coordinates in miles
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns Distance in miles
 */
export function calculateDistanceInMiles(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const km = calculateDistance(lat1, lon1, lat2, lon2);
	return km * 0.621371; // Convert km to miles
}

/**
 * Check if a coordinate is within a certain radius of another coordinate
 * @param centerLat - Latitude of the center point
 * @param centerLon - Longitude of the center point
 * @param checkLat - Latitude of the point to check
 * @param checkLon - Longitude of the point to check
 * @param radiusKm - Radius in kilometers
 * @returns true if the point is within the radius, false otherwise
 */
export function isWithinRadius(
	centerLat: number,
	centerLon: number,
	checkLat: number,
	checkLon: number,
	radiusKm: number,
): boolean {
	const distance = calculateDistance(centerLat, centerLon, checkLat, checkLon);
	return distance <= radiusKm;
}
