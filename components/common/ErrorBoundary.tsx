import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

interface Props {
	children: ReactNode;
	fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
		// You can log the error to an error reporting service here
	}

	retry = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback(this.state.error as Error, this.retry);
			}

			return (
				<View style={styles.container}>
					<Text style={styles.title}>Oops! Something went wrong</Text>
					<Text style={styles.message}>
						{this.state.error?.message || "An unexpected error occurred"}
					</Text>
					<Button title="Try Again" onPress={this.retry} />
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 10,
		textAlign: "center",
	},
	message: {
		fontSize: 16,
		color: "#666",
		marginBottom: 20,
		textAlign: "center",
	},
});
