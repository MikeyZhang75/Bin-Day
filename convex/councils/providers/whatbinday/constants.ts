// WhatBinDay API constants

export const WHATBINDAY_API_URL = "https://console.whatbinday.com/api/search";

export const WHATBINDAY_HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	"User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
	"X-Requested-With": "XMLHttpRequest",
	Accept: "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
	Origin: "https://console.whatbinday.com",
};

// Add API keys here - could be moved to environment variables
export const WHATBINDAY_API_KEYS: Record<string, string> = {
	COLAC_OTWAY: "5c83a498-a2ca-4bc2-bf1f-f1cc4d3872b4",
	// Add other council-specific API keys here
};
