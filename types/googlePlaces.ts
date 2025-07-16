export interface GooglePrediction {
	description: string;
	place_id: string;
	structured_formatting: {
		main_text: string;
		secondary_text: string;
		main_text_matched_substrings?: {
			offset: number;
			length: number;
		}[];
	};
	terms: {
		offset: number;
		value: string;
	}[];
	types: string[];
}

export interface GoogleAutocompleteResponse {
	predictions: GooglePrediction[];
	status: string;
}

export interface GooglePlaceDetails {
	formatted_address: string;
	address_components: {
		long_name: string;
		short_name: string;
		types: string[];
	}[];
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
		viewport?: {
			northeast: {
				lat: number;
				lng: number;
			};
			southwest: {
				lat: number;
				lng: number;
			};
		};
	};
}
export interface GooglePlaceDetailsResponse {
	html_attributions: string[];
	result: GooglePlaceDetails;
	status: string;
}
