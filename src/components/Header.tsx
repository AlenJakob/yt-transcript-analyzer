'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/nextjs';

import { Box, Container, Typography, Chip, Stack, Button, Badge } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';

interface HeaderProps {
	activeTab: 'analyzer' | 'archive' | 'profile';
	historyCount: number;
	onTabChange: (tab: 'analyzer' | 'archive' | 'profile') => void;
}

export default function Header({ activeTab, historyCount, onTabChange }: HeaderProps) {
	const [mounted, setMounted] = useState(false);
	const { openSignIn } = useClerk();

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<Box
			component="header"
			sx={{
				py: 2.5,
				borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
				background:
					'linear-gradient(180deg, rgba(18, 24, 36, 0.85) 0%, rgba(10, 13, 20, 0.95) 100%)',
				backdropFilter: 'blur(12px)',
				sticky: 'top',
				top: 0,
				zIndex: 1100,
			}}
		>
			<Container maxWidth="lg">
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={2}
					sx={{ alignItems: 'center', justifyContent: 'space-between' }}
				>
					<Stack
						direction="row"
						spacing={1.5}
						sx={{ alignItems: 'center', cursor: 'pointer' }}
						onClick={() => onTabChange('analyzer')}
					>
						<Box
							sx={{
								width: 42,
								height: 42,
								borderRadius: 3,
								background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
							}}
						>
							<YouTubeIcon sx={{ fontSize: 26, color: '#ffffff' }} />
						</Box>
						<Box>
							<Typography
								variant="h6"
								component="h1"
								sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}
							>
								YT Transcript Analyzer
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
							>
								<AutoAwesomeIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
							</Typography>
						</Box>
					</Stack>

					{/* Nawigacja zakładek: Analizator vs Archiwum vs Profil */}
					<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
						<Chip
							icon={<DarkModeIcon sx={{ fontSize: 15 }} />}
							label="Dark Mode"
							variant="outlined"
							size="medium"
							sx={{
								borderColor: 'rgba(255, 255, 255, 0.1)',
								bgcolor: 'rgba(255, 255, 255, 0.03)',
								color: 'text.secondary',
								borderRadius: 3,
								display: { xs: 'none', md: 'inline-flex' },
							}}
						/>
						<Button
							variant={activeTab === 'analyzer' ? 'contained' : 'outlined'}
							size="small"
							startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
							onClick={() => onTabChange('analyzer')}
							sx={{
								bgcolor: activeTab === 'analyzer' ? '#3b82f6' : 'transparent',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								color: activeTab === 'analyzer' ? '#ffffff' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
							}}
						>
							Analizator
						</Button>

						<Button
							variant={activeTab === 'archive' ? 'contained' : 'outlined'}
							size="small"
							startIcon={
								<Badge
									badgeContent={historyCount}
									color="primary"
									max={99}
									sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
								>
									<HistoryIcon sx={{ fontSize: 18 }} />
								</Badge>
							}
							onClick={() => onTabChange('archive')}
							sx={{
								bgcolor: activeTab === 'archive' ? '#3b82f6' : 'transparent',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								color: activeTab === 'archive' ? '#ffffff' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
							}}
						>
							Archiwum
						</Button>

						<Button
							variant={activeTab === 'profile' ? 'contained' : 'outlined'}
							size="small"
							startIcon={<PersonIcon sx={{ fontSize: 18 }} />}
							onClick={() => onTabChange('profile')}
							sx={{
								bgcolor: activeTab === 'profile' ? '#3b82f6' : 'transparent',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								color: activeTab === 'profile' ? '#ffffff' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
							}}
						>
							Profil
						</Button>

						{mounted && (
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
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
