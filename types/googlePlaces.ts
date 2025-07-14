export interface GooglePrediction {
	description: string;
	place_id: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
		main_text_matched_substrings?: Array<{
			offset: number;
			length: number;
		}>;
	};
	terms: Array<{
		offset: number;
		value: string;
	}>;
	types: string[];
}

export interface GoogleAutocompleteResponse {
	predictions: GooglePrediction[];
	status: string;
}

export interface GooglePlaceDetailsResponse {
	result: {
		formatted_address: string;
		address_components: Array<{
			long_name: string;
			short_name: string;
			types: string[];
		}>;
		geometry: {
			location: {
				lat: number;
				lng: number;
			};
		};
	};
	status: string;
}