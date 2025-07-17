// External package imports

// Type imports
import type { ViewProps } from "react-native";
import { View } from "react-native";
// Internal absolute imports
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
	lightColor?: string;
	darkColor?: string;
};

export function ThemedView({
	style,
	lightColor,
	darkColor,
	...otherProps
}: ThemedViewProps) {
	const backgroundColor = useThemeColor(
		{ light: lightColor, dark: darkColor },
		"background",
	);

	return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
