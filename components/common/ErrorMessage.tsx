import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ErrorMessageProps {
	message: string;
	onRetry?: () => void;
}

export const ErrorMessage = React.memo(
	({ message, onRetry }: ErrorMessageProps) => {
		const errorColor = "#FF3B30";
		const cardBgColor = useThemeColor(
			{ light: "#FFFFFF", dark: "#1C1C1E" },
			"text",
		);
		const borderColor = useThemeColor(
			{ light: "#E5E5E7", dark: "#2C2C2E" },
			"text",
		);

		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: cardBgColor, borderColor },
				]}
			>
				<View style={styles.content}>
					<IconSymbol
						name="exclamationmark.triangle"
						size={20}
						color={errorColor}
					/>
					<ThemedText style={[styles.message, { color: errorColor }]}>
						{message}
					</ThemedText>
				</View>
				{onRetry && (
					<ThemedText style={[styles.retryText, { color: errorColor }]}>
						Tap to retry
					</ThemedText>
				)}
			</View>
		);
	},
);

ErrorMessage.displayName = "ErrorMessage";

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 16,
		marginVertical: 8,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	message: {
		flex: 1,
		fontSize: 14,
		fontWeight: "500",
	},
	retryText: {
		fontSize: 12,
		marginTop: 8,
		textAlign: "center",
		opacity: 0.7,
	},
});
