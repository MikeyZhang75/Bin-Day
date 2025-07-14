import Mapbox from "@rnmapbox/maps";
import { useEffect, useState } from "react";
import {
	Alert,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

// You'll need to set your Mapbox access token
// For now, we'll use a placeholder - you should get your own from mapbox.com
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibWlrZXk3NSIsImEiOiJjbWQzMHd3ZncwajdyMmpxMHQxc2gyaHcxIn0.R2RzKVdK7wbU3Rtpl4jJoQ";

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function SearchScreen() {
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<
		{
			id?: string;
			place_name: string;
			geometry: { coordinates: [number, number] };
		}[]
	>([]);
	const textColor = useThemeColor({}, "text");
	const borderColor = useThemeColor({ light: "#e1e1e1", dark: "#333" }, "text");

	useEffect(() => {
		// Request location permissions
		if (Platform.OS === "ios") {
			Mapbox.requestAndroidLocationPermissions();
		}
	}, []);

	const searchForAddress = async (query: string) => {
		if (query.length < 3) {
			setSearchResults([]);
			return;
		}

		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					query,
				)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`,
			);
			const data = await response.json();
			setSearchResults(data.features || []);
		} catch (error) {
			console.error("Error searching for address:", error);
			Alert.alert("Error", "Failed to search for addresses");
		}
	};

	const selectAddress = (result: {
		place_name: string;
		geometry: { coordinates: [number, number] };
	}) => {
		setSelectedAddress(result.place_name);
		setSearchResults([]);
		setSearchQuery("");
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedView style={styles.header}>
				<ThemedText type="title">Search Location</ThemedText>
				<View style={[styles.searchContainer, { borderColor }]}>
					<TextInput
						style={[styles.searchInput, { color: textColor }]}
						placeholder="Search for an address..."
						placeholderTextColor={`${textColor}80`}
						value={searchQuery}
						onChangeText={(text) => {
							setSearchQuery(text);
							searchForAddress(text);
						}}
					/>
				</View>
			</ThemedView>

			{searchResults.length > 0 && (
				<ThemedView style={styles.resultsContainer}>
					{searchResults.map((result, index) => (
						<TouchableOpacity
							key={result.id || index}
							style={[styles.resultItem, { borderColor }]}
							onPress={() => selectAddress(result)}
						>
							<ThemedText>{result.place_name}</ThemedText>
						</TouchableOpacity>
					))}
				</ThemedView>
			)}

			<ThemedView style={styles.content}>
				<ThemedText type="subtitle">Selected Address:</ThemedText>
				<ThemedText style={styles.addressText}>
					{selectedAddress || "No address selected yet"}
				</ThemedText>
			</ThemedView>

			<View style={styles.mapContainer}>
				<Mapbox.MapView
					style={styles.map}
					styleURL={Mapbox.StyleURL.Street}
					zoomEnabled={true}
					scrollEnabled={true}
					pitchEnabled={false}
				>
					<Mapbox.Camera
						zoomLevel={10}
						centerCoordinate={[-0.1276, 51.5074]} // Default to London
					/>
				</Mapbox.MapView>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		padding: 20,
		paddingTop: 60,
		zIndex: 2,
	},
	searchContainer: {
		marginTop: 10,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
	},
	searchInput: {
		height: 40,
		fontSize: 16,
	},
	resultsContainer: {
		position: "absolute",
		top: 140,
		left: 20,
		right: 20,
		zIndex: 3,
		borderRadius: 8,
		overflow: "hidden",
	},
	resultItem: {
		padding: 12,
		borderBottomWidth: 1,
	},
	content: {
		padding: 20,
		zIndex: 1,
	},
	addressText: {
		marginTop: 10,
		fontSize: 16,
		fontStyle: "italic",
	},
	mapContainer: {
		flex: 1,
		marginTop: -20,
	},
	map: {
		flex: 1,
	},
});
