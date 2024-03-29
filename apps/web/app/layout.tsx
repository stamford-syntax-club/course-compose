import { ApplicationShell } from "@components/core/application-shell";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Course Compose",
	description: "Course Review Website by Stamford Syntax Club"
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
	const theme = createTheme({
		breakpoints: {
			xs: "576px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px"
		}
	});

	return (
		<html lang="en">
			<head>
				<ColorSchemeScript defaultColorScheme="dark" />
			</head>
			<body>
				<MantineProvider theme={theme} defaultColorScheme="dark">
					<ApplicationShell>{children}</ApplicationShell>
				</MantineProvider>
			</body>
		</html>
	);
}
