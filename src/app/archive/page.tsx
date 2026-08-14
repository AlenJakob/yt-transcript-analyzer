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

	useEffect(() => {
		setHistory(getHistory());
	}, []);

	const handleSelectHistoryItem = (item: HistoryItem) => {
		router.push(`/?videoId=${item.id}`);
	};

	const handleDeleteHistoryItem = (videoId: string) => {
		const updated = removeFromHistory(videoId);
		setHistory(updated);
	};

	const handleClearHistory = () => {
		const updated = clearHistory();
		setHistory(updated);
	};

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
			<Header historyCount={history.length} />
			<Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
				<ArchiveView
					history={history}
					onSelectHistoryItem={handleSelectHistoryItem}
					onDeleteItem={handleDeleteHistoryItem}
					onClearHistory={handleClearHistory}
				/>
			</Container>
		</Box>
	);
}
