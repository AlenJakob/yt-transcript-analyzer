'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, useClerk, useUser } from '@clerk/nextjs';
import { Box, Button, Skeleton } from '@mui/material';

export default function AuthButtonSlot() {
	const [mounted, setMounted] = useState(false);
	const { openSignIn } = useClerk();
	const { isSignedIn } = useUser();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Szerokość slotu: 34px dla zalogowanego użytkownika (avatar), 104px dla przycisku zaloguj
	const targetWidth = mounted && isSignedIn ? 34 : 104;

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'flex-end',
				minWidth: targetWidth,
				height: 34,
				ml: 0.5,
				transition: 'min-width 0.2s ease-in-out',
			}}
		>
			{!mounted ? (
				<Skeleton
					variant="rectangular"
					width={targetWidth}
					height={32}
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.06)',
						borderRadius: 3,
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
								borderColor: 'rgba(255, 255, 255, 0.2)',
								color: '#ffffff',
								px: 2,
								whiteSpace: 'nowrap',
								borderRadius: 3,
								'&:hover': {
									borderColor: '#3b82f6',
									bgcolor: 'rgba(59, 130, 246, 0.08)',
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
