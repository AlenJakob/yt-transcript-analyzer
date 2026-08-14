'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box } from '@mui/material';
import Header from '@/components/Header';
import ArchiveView from '@/components/ArchiveView';
import {
	getHistory,
	removeFromHistory,
	clearHistory,
	HistoryItem,
} from '@/lib/storage';

export default function ArchivePage() {
	const router = useRouter();
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		try {
			const data = getHistory();
			setHistory(data);
		} catch (err) {
			console.error('Błąd podczas ładowania historii z localStorage:', err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleSelectHistoryItem = (item: HistoryItem) => {
		router.push(`/?videoId=${item.id}`);
	};

	const handleDeleteHistoryItem = (videoId: string) => {
		try {
			const updated = removeFromHistory(videoId);
			setHistory(updated);
		} catch (err) {
			console.error('Błąd podczas usuwania elementu z localStorage:', err);
		}
	};

	const handleClearHistory = () => {
		try {
			const updated = clearHistory();
			setHistory(updated);
		} catch (err) {
			console.error('Błąd podczas czyszczenia historii z localStorage:', err);
		}
	};

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
			<Header historyCount={history.length} />
			<Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
				<ArchiveView
					history={history}
					isLoading={isLoading}
					onSelectHistoryItem={handleSelectHistoryItem}
					onDeleteItem={handleDeleteHistoryItem}
					onClearHistory={handleClearHistory}
				/>
			</Container>
		</Box>
	);
}
