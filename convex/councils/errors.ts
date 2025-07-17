// Standardized error classes for council implementations

export class CouncilAPIError extends Error {
	constructor(councilName: string, status?: number) {
		super(
			status
				? `HTTP error! status: ${status}`
				: `Failed to fetch data from ${councilName} council`,
		);
		this.name = "CouncilAPIError";
	}
}

export class AddressNotFoundError extends Error {
	constructor() {
		super("No results found for this address");
		this.name = "AddressNotFoundError";
	}
}

export class InvalidResponseError extends Error {
	constructor(message = "Invalid response structure") {
		super(message);
		this.name = "InvalidResponseError";
	}
}

// Utility function for safe JSON parsing
export async function safeJsonParse<T>(response: Response): Promise<T> {
	try {
		return await response.json();
	} catch {
		throw new InvalidResponseError("Failed to parse JSON response");
	}
}

// Utility function for logging errors consistently
export function logError(councilName: string, error: unknown): void {
	console.error(`${councilName} API error:`, error);
}
