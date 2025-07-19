// WhatBinDay API constants

import { COUNCIL_NAMES, type CouncilName } from "../../core";

export const WHATBINDAY_API_URL = "https://console.whatbinday.com/api/search";

export const WHATBINDAY_HEADERS = {
	"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	"User-Agent": "Mozilla/5.0 (compatible; BinDayApp/1.0)",
	"X-Requested-With": "XMLHttpRequest",
	Accept: "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
	Origin: "https://console.whatbinday.com",
};

// Map council names to their WhatBinDay API keys
// This approach is more maintainable as it directly uses the council name values
export const WHATBINDAY_API_KEYS = {
	[COUNCIL_NAMES.COLAC_OTWAY]: "5c83a498-a2ca-4bc2-bf1f-f1cc4d3872b4",
	[COUNCIL_NAMES.QUEENSCLIFFE]: "6b9437df-f4c2-487b-abea-420557f00a0c",
	[COUNCIL_NAMES.STRATHBOGIE_SHIRE]: "90558b7b-ef76-4ae5-8734-86e806a410e5",
} as const;

// Type for councils that use WhatBinDay
export type WhatBinDayCouncil = keyof typeof WHATBINDAY_API_KEYS;

// Type guard to check if a council uses WhatBinDay
export function isWhatBinDayCouncil(
	council: CouncilName,
): council is WhatBinDayCouncil {
	return council in WHATBINDAY_API_KEYS;
}
