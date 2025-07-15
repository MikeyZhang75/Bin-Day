import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
	EXPO_PUBLIC_CONVEX_URL: str(),
});
