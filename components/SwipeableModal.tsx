// External package imports
import { useCallback, useEffect, useRef } from "react";
// Type imports
import type { ModalProps, ViewStyle } from "react-native";
import {
	Animated,
	Dimensions,
	Modal,
	PanResponder,
	Platform,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
// Internal absolute imports
import { useThemeColor } from "@/hooks/useThemeColor";

// Constants
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const OVERLAY_MAX_OPACITY = 0.5;
const ANIMATION_DURATION = 200;
const SPRING_TENSION = 65;
const SPRING_FRICTION = 11;
const OVERLAY_FADE_DURATION = 300;

interface SwipeableModalProps
	extends Omit<ModalProps, "animationType" | "children"> {
	visible: boolean;
	onClose: () => void;
	children: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
	style?: ViewStyle;
	showDragIndicator?: boolean;
	swipeThreshold?: number;
	swipeVelocityThreshold?: number;
}

export function SwipeableModal({
	visible,
	onClose,
	children,
	style,
	showDragIndicator = true,
	swipeThreshold = SWIPE_THRESHOLD,
	swipeVelocityThreshold = SWIPE_VELOCITY_THRESHOLD,
	...modalProps
}: SwipeableModalProps) {
	// Theme colors
	const backgroundColor = useThemeColor({}, "background");
	const indicatorColor = useThemeColor(
		{ light: "#C0C0C0", dark: "#666" },
		"text",
	);

	// Animation values
	const modalTranslateY = useRef(new Animated.Value(0)).current;
	const modalOpacity = useRef(new Animated.Value(0)).current;
	const screenHeight = Dimensions.get("window").height;

	// Pan responder for swipe gesture
	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				// Only respond to downward swipes
				return gestureState.dy > 0;
			},
			onPanResponderMove: (_, gestureState) => {
				// Only allow downward movement
				if (gestureState.dy > 0) {
					modalTranslateY.setValue(gestureState.dy);
					// Calculate opacity based on position (1 at top, 0 at bottom)
					const opacity = Math.max(0, 1 - gestureState.dy / screenHeight);
					modalOpacity.setValue(opacity * OVERLAY_MAX_OPACITY);
				}
			},
			onPanResponderRelease: (_, gestureState) => {
				// If swiped down more than threshold or with velocity, close modal
				if (
					gestureState.dy > swipeThreshold ||
					gestureState.vy > swipeVelocityThreshold
				) {
					Animated.parallel([
						Animated.timing(modalTranslateY, {
							toValue: screenHeight,
							duration: ANIMATION_DURATION,
							useNativeDriver: true,
						}),
						Animated.timing(modalOpacity, {
							toValue: 0,
							duration: ANIMATION_DURATION,
							useNativeDriver: true,
						}),
					]).start(() => {
						onClose();
					});
				} else {
					// Snap back to original position
					Animated.parallel([
						Animated.spring(modalTranslateY, {
							toValue: 0,
							useNativeDriver: true,
						}),
						Animated.spring(modalOpacity, {
							toValue: OVERLAY_MAX_OPACITY,
							useNativeDriver: true,
						}),
					]).start();
				}
			},
		}),
	).current;

	// Handle modal open/close animations
	useEffect(() => {
		if (visible) {
			// Reset position and animate in
			modalTranslateY.setValue(screenHeight);
			modalOpacity.setValue(0);
			Animated.parallel([
				Animated.spring(modalTranslateY, {
					toValue: 0,
					useNativeDriver: true,
					tension: SPRING_TENSION,
					friction: SPRING_FRICTION,
				}),
				Animated.timing(modalOpacity, {
					toValue: OVERLAY_MAX_OPACITY,
					duration: OVERLAY_FADE_DURATION,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible, modalTranslateY, modalOpacity, screenHeight]);

	// Close modal with animation
	const closeModal = useCallback(() => {
		Animated.parallel([
			Animated.timing(modalTranslateY, {
				toValue: screenHeight,
				duration: ANIMATION_DURATION,
				useNativeDriver: true,
			}),
			Animated.timing(modalOpacity, {
				toValue: 0,
				duration: ANIMATION_DURATION,
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose();
		});
	}, [modalTranslateY, modalOpacity, screenHeight, onClose]);

	return (
		<Modal
			visible={visible}
			animationType="none"
			transparent={true}
			onRequestClose={closeModal}
			{...modalProps}
		>
			<View style={styles.modalContainer}>
				<Animated.View
					style={[
						styles.modalOverlay,
						{
							opacity: modalOpacity,
						},
					]}
				>
					<Pressable
						style={styles.modalOverlayPressable}
						onPress={closeModal}
					/>
				</Animated.View>
				<Animated.View
					style={[
						styles.modalContent,
						{
							backgroundColor,
							transform: [{ translateY: modalTranslateY }],
						},
						style,
					]}
					{...panResponder.panHandlers}
				>
					{showDragIndicator && (
						<View style={styles.dragIndicatorContainer}>
							<View
								style={[
									styles.dragIndicator,
									{ backgroundColor: indicatorColor },
								]}
							/>
						</View>
					)}
					{typeof children === "function" ? children(closeModal) : children}
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
	},
	modalOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 1)",
	},
	modalOverlayPressable: {
		flex: 1,
	},
	modalContent: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: Platform.OS === "ios" ? 40 : 20,
		maxHeight: "80%",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	dragIndicatorContainer: {
		alignItems: "center",
		paddingVertical: 10,
		marginTop: -10,
	},
	dragIndicator: {
		width: 40,
		height: 5,
		borderRadius: 2.5,
	},
});
