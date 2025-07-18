import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// Monash-specific regex patterns for waste types
const monashWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	hardWaste:
		/one-off-service[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

const searchHeaders = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	Accept: "text/plain, */*; q=0.01",
	"Accept-Language": "en-US,en;q=0.9",
	"Accept-Encoding": "gzip, deflate, br",
	Referer: "https://www.monash.vic.gov.au/",
	Origin: "https://www.monash.vic.gov.au",
	"X-Requested-With": "XMLHttpRequest",
	"Sec-Fetch-Dest": "empty",
	"Sec-Fetch-Mode": "cors",
	"Sec-Fetch-Site": "same-origin",
};

const wasteHeaders = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	Accept: "application/json, text/javascript, */*; q=0.01",
	"Accept-Encoding": "gzip, deflate, br, zstd",
	"sec-ch-ua-platform": '"macOS"',
	"x-requested-with": "XMLHttpRequest",
	"sec-ch-ua":
		'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
	"sec-ch-ua-mobile": "?0",
	"sec-fetch-site": "same-origin",
	"sec-fetch-mode": "cors",
	"sec-fetch-dest": "empty",
	referer:
		"https://www.monash.vic.gov.au/Waste-Sustainability/Bin-Collection/When-we-collect-your-bins",
	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
	priority: "u=1, i",
};

export async function fetchMonashData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.CITY_OF_MONASH, {
		searchApiUrl: "https://www.monash.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.monash.vic.gov.au/ocapi/Public/myarea/wasteservices",
		searchHeaders,
		wasteHeaders,
		wasteTypePatterns: monashWastePatterns,
	});
}
