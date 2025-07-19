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
	SHEPPARTON: "Greater Shepparton City",
	HUME_CITY: "Hume City",
	KINGSTON_CITY: "City of Kingston",
	LODDON_SHIRE: "Loddon Shire",
	MACEDON_RANGES: "Macedon Ranges Shire",
	MANSFIELD_SHIRE: "Mansfield Shire",
	MAROONDAH_CITY: "Maroondah City",
	MELTON_CITY: "Melton City",
	MILDURA_CITY: "Mildura Rural City",
	MOORABOOL_SHIRE: "Moorabool Shire",
	MORNINGTON_PENINSULA: "Mornington Peninsula Shire",
	MOUNT_ALEXANDER: "Mount Alexander Shire",
	MOYNE_SHIRE: "Moyne Shire",
	NILLUMBIK_SHIRE: "Nillumbik Shire",
	PYRENEES_SHIRE: "Pyrenees Shire",
	// SOUTHERN_GRAMPIANS: "Southern Grampians Shire", // API is not working
	STONNINGTON_CITY: "Stonnington City",
	SURF_COAST_SHIRE: "Surf Coast Shire",
	SWAN_HILL_CITY: "Swan Hill Rural City",
	WANGARATTA_CITY: "Wangaratta Rural City",
	WHITTLESEA_CITY: "City of Whittlesea",
	YARRA_RANGES: "Yarra Ranges Shire",
	MARIBYRNONG_CITY: "Maribyrnong City",
	COLAC_OTWAY: "Colac Otway Shire",
	QUEENSCLIFFE: "Queenscliffe Borough",
	STRATHBOGIE_SHIRE: "Strathbogie Shire",
} as const;

export type CouncilName = (typeof COUNCIL_NAMES)[keyof typeof COUNCIL_NAMES];

// Helper function to check if a string is a valid council name
export const isValidCouncilName = (council: string): council is CouncilName => {
	return Object.values(COUNCIL_NAMES).includes(council as CouncilName);
};
