'use client';

import { useState, useEffect, startTransition } from 'react';
import { SignedIn, SignedOut, UserButton, useClerk, useUser } from '@clerk/nextjs';
import { Box, Button, Skeleton, Stack, Snackbar, Alert } from '@mui/material';

export default function AuthButtonSlot() {
	const [mounted, setMounted] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const { openSignIn } = useClerk();
	const { isLoaded } = useUser();

	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	const isReady = mounted && isLoaded;

	const handleDemoLogin = async () => {
		try {
			await navigator.clipboard.writeText('Test-tube-123456');
			setSnackbarOpen(true);
		} catch (err) {
			console.error('Clipboard copy failed:', err);
		}
		openSignIn({
			initialValues: {
				emailAddress: 'tryndamerej@gmail.com',
			},
		});
	};

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				minWidth: 34,
				height: 34,
				ml: 0.5,
			}}
		>
			{!isReady ? (
				<Skeleton
					variant="circular"
					width={34}
					height={34}
					sx={{
						bgcolor: (theme) =>
							theme.palette.mode === 'dark'
								? 'rgba(255, 255, 255, 0.08)'
								: 'rgba(0, 0, 0, 0.08)',
					}}
				/>
			) : (
				<>
					<SignedOut>
						<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
							<Button
								variant="outlined"
								size="small"
								onClick={handleDemoLogin}
								sx={{
									bgcolor: (theme) =>
										theme.palette.mode === 'dark'
											? 'rgba(245, 158, 11, 0.12)'
											: 'rgba(245, 158, 11, 0.08)',
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#fbbf24' : '#d97706',
									borderColor: 'rgba(245, 158, 11, 0.35)',
									px: 1.5,
									whiteSpace: 'nowrap',
									borderRadius: 2,
									fontWeight: 600,
									fontSize: '0.8rem',
									'&:hover': {
										borderColor: '#f59e0b',
										bgcolor: (theme) =>
											theme.palette.mode === 'dark'
												? 'rgba(245, 158, 11, 0.22)'
												: 'rgba(245, 158, 11, 0.15)',
									},
								}}
							>
								🔑 Konto Demo
							</Button>
							<Button
								variant="outlined"
								size="small"
								onClick={() => openSignIn()}
								sx={{
									borderColor: 'divider',
									color: 'text.primary',
									px: 2,
									whiteSpace: 'nowrap',
									borderRadius: 2,
									fontWeight: 600,
									'&:hover': {
										borderColor: '#3b82f6',
										bgcolor: (theme) =>
											theme.palette.mode === 'dark'
												? 'rgba(59, 130, 246, 0.15)'
												: 'rgba(59, 130, 246, 0.08)',
									},
								}}
							>
								Zaloguj się
							</Button>
						</Stack>
					</SignedOut>

					<SignedIn>
						<UserButton
							appearance={{
								elements: {
									avatarBox: { width: 34, height: 34 },
								},
							}}
						/>
					</SignedIn>

					<Snackbar
						open={snackbarOpen}
						autoHideDuration={6000}
						onClose={() => setSnackbarOpen(false)}
						anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					>
						<Alert
							onClose={() => setSnackbarOpen(false)}
							severity="warning"
							sx={{ width: '100%', fontWeight: 600 }}
						>
							E-mail wpisany automatycznie. Skopiowano hasło Demo do schowka! (Wklej Ctrl+V)
						</Alert>
					</Snackbar>
				</>
			)}
		</Box>
	);
}
