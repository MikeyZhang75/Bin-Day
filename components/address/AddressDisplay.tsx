import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { extractAddressComponents } from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";

interface AddressDisplayProps {
	selectedAddress: string | null;
	selectedPlaceDetails: GooglePlaceDetails | null;
	selectedCouncil: string | null;
	onClear: () => void;
}

export function AddressDisplay({
	selectedAddress,
	selectedPlaceDetails,
	selectedCouncil,
	onClear,
}: AddressDisplayProps) {
	const textColor = useThemeColor({}, "text");

	if (!selectedAddress) {
		return null;
	}

	return (
		<View style={styles.locationHeader}>
			<View style={styles.locationInfo}>
				{selectedPlaceDetails ? (
					(() => {
						const components = extractAddressComponents(selectedPlaceDetails);
						const streetAddress = components.subpremise
							? `${components.subpremise}/${components.streetNumber} ${components.route}`
							: `${components.streetNumber} ${components.route}`;
						const line1 = streetAddress.trim() || components.route;
						const line2 =
							`${components.locality} ${components.administrativeAreaLevel1} ${components.postalCode}`.trim();

						return (
							<>
								<ThemedText style={styles.addressLine1}>{line1}</ThemedText>
								<ThemedText style={styles.addressLine2}>
									{line2}
									{selectedCouncil && ` • ${selectedCouncil}`}
								</ThemedText>
							</>
						);
					})()
				) : (
					<>
						<ThemedText style={styles.addressLine1}>
							{selectedAddress}
						</ThemedText>
						{selectedCouncil && (
							<ThemedText style={styles.addressLine2}>
								{selectedCouncil}
							</ThemedText>
						)}
					</>
				)}
			</View>
			<Pressable onPress={onClear} style={styles.changeButton}>
				<IconSymbol
					name="xmark.circle.fill"
					size={24}
					color={`${textColor}40`}
				/>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	locationHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	locationInfo: {
		flex: 1,
		marginRight: 12,
	},
	addressLine1: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 4,
	},
	addressLine2: {
		fontSize: 14,
		opacity: 0.6,
	},
	changeButton: {
		padding: 8,
	},
});
