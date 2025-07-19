// Granicus-specific types

export type GranicusApiResponse = {
	Items: {
		Id: string;
		AddressSingleLine: string;
		MunicipalSubdivision: string;
		Distance: number;
		Score: number;
		LatLon: [number, number] | null;
	}[];
	Offset: number;
	Limit: number;
	Total: number;
};

export type GranicusWasteServicesResponse = {
	success: boolean;
	responseContent: string;
};

export type WasteTypeRegexPatterns = {
	landfillWaste?: RegExp;
	recycling?: RegExp;
	foodAndGardenWaste?: RegExp;
	hardWaste?: RegExp;
	glass?: RegExp;
};

export type GranicusConfig = {
	searchApiUrl: string;
	wasteServicesUrl: string;
	wasteTypePatterns: WasteTypeRegexPatterns;
};
