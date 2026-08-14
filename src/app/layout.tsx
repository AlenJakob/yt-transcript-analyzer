import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'YouTube Transcript Analyzer',
	description:
		'Narzędzie do pobierania, przeglądania i analizy transkrypcji z filmów YouTube z szablonami promptów AI.',
};

import ThemeRegistry from '@/components/ThemeRegistry';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
			<body>
				<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
					<ThemeRegistry>{children}</ThemeRegistry>
				</ClerkProvider>
			</body>
		</html>
	);
}
