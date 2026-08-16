'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Grid, Stack, Pagination } from '@mui/material';
import { HistoryItem } from '@/lib/storage';
import ArchiveHeader from './ArchiveHeader';
import ArchiveCard from './ArchiveCard';
import ArchiveSkeleton from './ArchiveSkeleton';
import ArchiveEmptyState from './ArchiveEmptyState';
import ArchiveDeleteDialogs from './ArchiveDeleteDialogs';

export interface ArchiveViewProps {
	history: HistoryItem[];
	isLoading?: boolean;
	onSelectHistoryItem: (item: HistoryItem) => void;
	onDeleteItem: (videoId: string) => void;
	onClearHistory: () => void;
}

const ITEMS_PER_PAGE = 12;

export default function ArchiveView({
	history,
	isLoading = false,
	onSelectHistoryItem,
	onDeleteItem,
	onClearHistory,
}: ArchiveViewProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [confirmClearOpen, setConfirmClearOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	useEffect(() => {
		const start = performance.now();
		console.log(
			`[ArchiveView Perf] Zamontowano widok Archiwum (${history.length} rekordów w pamięci).`
		);
		return () => {
			const end = performance.now();
			console.log(
				`[ArchiveView Perf] Odmontowano widok Archiwum po ${(end - start).toFixed(2)} ms.`
			);
		};
	}, [history.length]);

	useEffect(() => {
		setPage(1);
	}, [searchQuery]);

	const filteredHistory = useMemo(() => {
		if (!searchQuery.trim()) return history;
		const query = searchQuery.toLowerCase();
		return history.filter(
			(item) =>
				item.metadata.title.toLowerCase().includes(query) ||
				item.metadata.authorName.toLowerCase().includes(query)
		);
	}, [history, searchQuery]);

	const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

	const paginatedHistory = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredHistory, page]);

	return (
		<Box sx={{ mb: 6 }}>
			<ArchiveHeader
				historyCount={history.length}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onConfirmClearOpen={() => setConfirmClearOpen(true)}
			/>

			{isLoading ? (
				<ArchiveSkeleton />
			) : filteredHistory.length > 0 ? (
				<>
					<Grid container spacing={2.5}>
						{paginatedHistory.map((item) => (
							<ArchiveCard
								key={item.id}
								item={item}
								onSelect={onSelectHistoryItem}
								onDelete={setItemToDelete}
							/>
						))}
					</Grid>

					{totalPages > 1 && (
						<Stack direction="row" sx={{ justifyContent: 'center', mt: 4 }}>
							<Pagination
								count={totalPages}
								page={page}
								onChange={(_, newPage) => setPage(newPage)}
								color="primary"
								size="medium"
							/>
						</Stack>
					)}
				</>
			) : (
				<ArchiveEmptyState searchQuery={searchQuery} />
			)}

			<ArchiveDeleteDialogs
				confirmClearOpen={confirmClearOpen}
				onCloseConfirmClear={() => setConfirmClearOpen(false)}
				onClearHistory={onClearHistory}
				historyLength={history.length}
				itemToDelete={itemToDelete}
				onCloseItemToDelete={() => setItemToDelete(null)}
				onDeleteItem={onDeleteItem}
			/>
		</Box>
	);
}
