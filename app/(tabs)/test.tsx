import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WasteCollectionGrid } from "@/components/waste/WasteCollectionGrid";
import type { CouncilData } from "@/convex/councilServices";
import { useThemeColor } from "@/hooks/useThemeColor";

// Mock data generator
function generateMockData(scenario: string): CouncilData {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const nextWeek = new Date(today);
	nextWeek.setDate(nextWeek.getDate() + 7);
	const twoWeeks = new Date(today);
	twoWeeks.setDate(twoWeeks.getDate() + 14);
	const threeWeeks = new Date(today);
	threeWeeks.setDate(threeWeeks.getDate() + 21);

	switch (scenario) {
		case "today-only":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: today.getTime(),
					recycling: today.getTime(),
					foodAndGardenWaste: today.getTime(),
					hardWaste: null,
					glass: null,
				},
			};
		case "today-and-future":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: today.getTime(),
					recycling: today.getTime(),
					foodAndGardenWaste: tomorrow.getTime(),
					hardWaste: nextWeek.getTime(),
					glass: twoWeeks.getTime(),
				},
			};
		case "no-today":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: tomorrow.getTime(),
					recycling: tomorrow.getTime(),
					foodAndGardenWaste: nextWeek.getTime(),
					hardWaste: twoWeeks.getTime(),
					glass: threeWeeks.getTime(),
				},
			};
		case "mixed-dates":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: today.getTime(),
					recycling: nextWeek.getTime(),
					foodAndGardenWaste: tomorrow.getTime(),
					hardWaste: twoWeeks.getTime(),
					glass: today.getTime(),
				},
			};
		case "some-null":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: tomorrow.getTime(),
					recycling: tomorrow.getTime(),
					foodAndGardenWaste: null,
					hardWaste: null,
					glass: nextWeek.getTime(),
				},
			};
		case "all-same-date":
			return {
				supported: true,
				council: "Test Council",
				message: "Waste collection data for Test Council",
				result: {
					landfillWaste: nextWeek.getTime(),
					recycling: nextWeek.getTime(),
					foodAndGardenWaste: nextWeek.getTime(),
					hardWaste: nextWeek.getTime(),
					glass: nextWeek.getTime(),
				},
			};
		default:
			return {
				supported: false,
				council: "Unsupported Council",
				message: "This council is not currently supported",
				result: null,
			};
	}
}

export default function TestScreen() {
	const [scenario, setScenario] = useState("today-and-future");
	const [isLoading, setIsLoading] = useState(false);
	const mockData = generateMockData(scenario);
	const backgroundColor = useThemeColor({}, "background");
	const textColor = useThemeColor({}, "text");
	const borderColor = useThemeColor(
		{ light: "#E5E5E7", dark: "#2C2C2E" },
		"text",
	);

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ThemedText type="title" style={styles.title}>
					Test Waste Collection Display
				</ThemedText>

				<View style={[styles.pickerContainer, { borderColor }]}>
					<ThemedText style={styles.pickerLabel}>Test Scenario:</ThemedText>
					<View
						style={[styles.pickerWrapper, { backgroundColor, borderColor }]}
					>
						<Picker
							selectedValue={scenario}
							onValueChange={setScenario}
							style={{ color: textColor }}
						>
							<Picker.Item
								label="Today + Future Collections"
								value="today-and-future"
							/>
							<Picker.Item label="Today Only" value="today-only" />
							<Picker.Item label="No Today Collections" value="no-today" />
							<Picker.Item label="Mixed Dates" value="mixed-dates" />
							<Picker.Item label="Some N/A Dates" value="some-null" />
							<Picker.Item label="All Same Date" value="all-same-date" />
							<Picker.Item label="Unsupported Council" value="unsupported" />
						</Picker>
					</View>
				</View>

				<View style={styles.loadingToggle}>
					<ThemedText>Loading State:</ThemedText>
					<View style={styles.buttonRow}>
						<View
							style={[
								styles.button,
								!isLoading && styles.activeButton,
								{ borderColor },
							]}
						>
							<ThemedText
								style={styles.buttonText}
								onPress={() => setIsLoading(false)}
							>
								Not Loading
							</ThemedText>
						</View>
						<View
							style={[
								styles.button,
								isLoading && styles.activeButton,
								{ borderColor },
							]}
						>
							<ThemedText
								style={styles.buttonText}
								onPress={() => setIsLoading(true)}
							>
								Loading
							</ThemedText>
						</View>
					</View>
				</View>

				<View style={styles.divider} />

				<ThemedText type="subtitle" style={styles.sectionTitle}>
					Preview:
				</ThemedText>

				<WasteCollectionGrid
					councilData={mockData}
					isLoadingCouncilData={isLoading}
				/>

				<View style={styles.divider} />

				<ThemedText type="subtitle" style={styles.sectionTitle}>
					Mock Data:
				</ThemedText>
				<View style={[styles.codeBlock, { backgroundColor, borderColor }]}>
					<ThemedText style={styles.codeText}>
						{JSON.stringify(mockData, null, 2)}
					</ThemedText>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 100,
	},
	title: {
		marginBottom: 20,
		marginTop: 40,
	},
	pickerContainer: {
		marginBottom: 20,
	},
	pickerLabel: {
		marginBottom: 8,
		fontSize: 16,
		fontWeight: "600",
	},
	pickerWrapper: {
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
	loadingToggle: {
		marginBottom: 20,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 10,
		marginTop: 8,
	},
	button: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
	},
	activeButton: {
		backgroundColor: "#007AFF20",
	},
	buttonText: {
		fontSize: 14,
		fontWeight: "500",
	},
	divider: {
		height: 1,
		backgroundColor: "#E5E5E7",
		marginVertical: 20,
	},
	sectionTitle: {
		marginBottom: 16,
	},
	codeBlock: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
	},
	codeText: {
		fontFamily: "SpaceMono",
		fontSize: 12,
	},
});
