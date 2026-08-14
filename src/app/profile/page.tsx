'use client';

import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import Header from '@/components/Header';
import ProfileView from '@/components/ProfileView';
import { getHistory } from '@/lib/storage';

export default function ProfilePage() {
	const [historyCount, setHistoryCount] = useState(0);

	useEffect(() => {
		setHistoryCount(getHistory().length);
	}, []);

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
			<Header historyCount={historyCount} />
			<Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
				<ProfileView />
			</Container>
		</Box>
	);
}
