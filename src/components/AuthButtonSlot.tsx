'use client';

import { useState, useEffect, startTransition } from 'react';
import { SignedIn, SignedOut, UserButton, useClerk, useUser } from '@clerk/nextjs';
import { Box, Button, Skeleton } from '@mui/material';

export default function AuthButtonSlot() {
	const [mounted, setMounted] = useState(false);
	const { openSignIn } = useClerk();
	const { isLoaded } = useUser();

	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	const isReady = mounted && isLoaded;

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
				</>
			)}
		</Box>
	);
}
