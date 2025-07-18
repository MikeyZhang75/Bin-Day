import type { RefObject } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
} from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

interface SearchBarProps {
	searchQuery: string;
	onSearchQueryChange: (text: string) => void;
	onFocus: () => void;
	onBlur: () => void;
	onClear: () => void;
	inputRef: RefObject<TextInput | null>;
	inputFocusAnim: Animated.SharedValue<number>;
}

export function SearchBar({
	searchQuery,
	onSearchQueryChange,
	onFocus,
	onBlur,
	onClear,
	inputRef,
	inputFocusAnim,
}: SearchBarProps) {
	const textColor = useThemeColor({}, "text");
	const tintColor = useThemeColor({}, "tint");
	const cardBgColor = useThemeColor(
		{ light: "#FFFFFF", dark: "#1C1C1E" },
		"text",
	);

	const animatedContainerStyle = useAnimatedStyle(() => {
		const progress = inputFocusAnim?.value || 0;
		const borderColor = interpolateColor(
			progress,
			[0, 1],
			[`${textColor}20`, tintColor],
		);

		return {
			borderColor,
		};
	});

	const animatedInactiveIconStyle = useAnimatedStyle(() => {
		return {
			opacity: 1 - (inputFocusAnim?.value || 0),
		};
	});

	const animatedActiveIconStyle = useAnimatedStyle(() => {
		return {
			opacity: inputFocusAnim?.value || 0,
		};
	});

	return (
		<Pressable
			onPress={() => {
				inputRef.current?.focus();
			}}
		>
			<Animated.View
				style={[
					styles.searchContainer,
					{
						backgroundColor: cardBgColor,
					},
					animatedContainerStyle,
				]}
			>
				<View style={styles.searchIcon}>
					<Animated.View
						style={[
							{
								position: "absolute",
							},
							animatedInactiveIconStyle,
						]}
					>
						<IconSymbol
							name="magnifyingglass"
							size={20}
							color={`${textColor}60`}
						/>
					</Animated.View>
					<Animated.View style={animatedActiveIconStyle}>
						<IconSymbol name="magnifyingglass" size={20} color={tintColor} />
					</Animated.View>
				</View>
				<TextInput
					ref={inputRef}
					style={[styles.searchInput, { color: textColor }]}
					placeholder="Search address or postcode"
					placeholderTextColor={`${textColor}40`}
					value={searchQuery}
					onChangeText={onSearchQueryChange}
					onFocus={onFocus}
					onBlur={onBlur}
					returnKeyType="search"
					autoCorrect={false}
					autoCapitalize="none"
				/>
				{searchQuery.length > 0 && (
					<Pressable onPress={onClear} style={styles.clearButton}>
						<IconSymbol
							name="xmark.circle.fill"
							size={20}
							color={`${textColor}40`}
						/>
					</Pressable>
				)}
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.5,
		borderRadius: 16,
		paddingHorizontal: 16,
		height: 56,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	searchIcon: {
		marginRight: 12,
	},
	searchInput: {
		flex: 1,
		fontSize: 17,
		paddingVertical: 0,
		fontWeight: "400",
	},
	clearButton: {
		marginLeft: 8,
		padding: 4,
	},
});
