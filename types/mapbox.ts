// Types for Mapbox Search Box API

export interface MapboxSuggestion {
	mapbox_id: string;
	name: string;
	name_preferred: string;
	place_formatted: string;
	context?: {
		country?: {
			name: string;
			country_code?: string;
		};
		region?: {
			name: string;
			region_code?: string;
		};
		locality?: { name: string };
		place?: { name: string };
		postcode?: { name: string };
	};
	feature_type: string;
}

export interface MapboxSuggestResponse {
	suggestions: MapboxSuggestion[];
}

export interface MapboxRetrieveResponse {
	features: {
		properties: {
			name: string;
			name_preferred: string;
			place_formatted: string;
			full_address: string;
			coordinates: {
				longitude: number;
				latitude: number;
			};
			context?: {
				country?: {
					name: string;
					country_code?: string;
				};
				region?: {
					name: string;
					region_code?: string;
				};
				locality?: { name: string };
				place?: { name: string };
				postcode?: { name: string };
			};
		};
		geometry: {
			coordinates: [number, number];
		};
	}[];
}
