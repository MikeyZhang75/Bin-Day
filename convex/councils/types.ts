// Council types and constants

export const COUNCIL_NAMES = {
	CITY_OF_MONASH: "City of Monash",
	ALPINE_SHIRE: "Alpine Shire",
	CITY_OF_BALLARAT: "City of Ballarat",
	BANYULE_CITY: "Banyule City",
	GANNAWARRA_SHIRE: "Gannawarra Shire",
	BAW_BAW_SHIRE: "Baw Baw Shire",
	BAYSIDE_CITY: "Bayside City",
	CAMPASPE_SHIRE: "Campaspe Shire",
	GREATER_DANDENONG: "Greater Dandenong City",
} as const;

export type CouncilName = (typeof COUNCIL_NAMES)[keyof typeof COUNCIL_NAMES];

// Helper function to check if a string is a valid council name
export const isValidCouncilName = (council: string): council is CouncilName => {
	return Object.values(COUNCIL_NAMES).includes(council as CouncilName);
};
