import { ApplicationShell } from "@components/core/application-shell";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Course Compose",
	description: "Course Review Website by Stamford Syntax Club"
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider>
					<ApplicationShell>{children}</ApplicationShell>
				</MantineProvider>
			</body>
		</html>
	);
}
