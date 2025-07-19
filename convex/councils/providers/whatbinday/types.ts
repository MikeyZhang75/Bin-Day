// WhatBinDay API types

import type { DateTime } from "luxon";

export interface WhatBinDayAddress {
	address: {
		street_number: string;
		route: string;
		locality: string;
		administrative_area_level_1: string;
		postal_code: string;
		part: string;
		subpremise: string;
		formatted_address: string;
	};
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
	};
}

export interface ParsedBinEvent {
	date: DateTime;
	binTypes: string[];
}
