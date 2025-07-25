// Granicus API constants and configuration

export const GRANICUS_SEARCH_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	Accept: "text/plain, */*; q=0.01",
	"Accept-Encoding": "gzip, deflate, br, zstd",
	"sec-ch-ua-platform": '"macOS"',
	"x-requested-with": "XMLHttpRequest",
	"sec-ch-ua":
		'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
	"sec-ch-ua-mobile": "?0",
	"sec-fetch-site": "same-origin",
	"sec-fetch-mode": "cors",
	"sec-fetch-dest": "empty",
	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
	priority: "u=1, i",
};

export const GRANICUS_WASTE_HEADERS = {
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
	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
	priority: "u=1, i",
};

// Common Granicus API endpoints pattern
export const GRANICUS_ENDPOINTS = {
	search: "/api/v1/myarea/search",
	wasteServices: "/ocapi/Public/myarea/wasteservices",
} as const;
