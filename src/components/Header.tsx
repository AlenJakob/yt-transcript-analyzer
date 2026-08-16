'use client';

import { useState, useEffect, startTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Container, Typography, Chip, Stack, Button, Badge } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AuthButtonSlot from '@/components/AuthButtonSlot';
import { useAuthUser } from '@/hooks/useAuthUser';

interface HeaderProps {
	historyCount?: number;
}

export default function Header({ historyCount = 0 }: HeaderProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { isAdmin } = useAuthUser();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		startTransition(() => {
			setMounted(true);
		});
	}, []);

	const displayHistoryCount = mounted ? historyCount : 0;

	const isAnalyzer = pathname === '/';
	const isArchive = pathname === '/archive';
	const isProfile = pathname === '/profile';

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
						onClick={() => router.push('/')}
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
							variant={isAnalyzer ? 'contained' : 'outlined'}
							size="small"
							startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
							onClick={() => router.push('/')}
							sx={{
								bgcolor: isAnalyzer ? '#3b82f6' : 'transparent',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								color: isAnalyzer ? '#ffffff' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
							}}
						>
							Analizator
						</Button>

						<Button
							variant={isArchive ? 'contained' : 'outlined'}
							size="small"
							startIcon={
								mounted ? (
									<Badge
										badgeContent={historyCount}
										color="primary"
										max={99}
										sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
									>
										<HistoryIcon sx={{ fontSize: 18 }} />
									</Badge>
								) : (
									<HistoryIcon sx={{ fontSize: 18 }} />
								)
							}
							onClick={() => router.push('/archive')}
							sx={{
								bgcolor: isArchive ? '#3b82f6' : 'transparent',
								borderColor: 'rgba(255, 255, 255, 0.15)',
								color: isArchive ? '#ffffff' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
							}}
						>
							Archiwum
						</Button>

						<Button
							variant={isProfile ? 'contained' : 'outlined'}
							size="small"
							startIcon={
								isAdmin ? (
									<AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
								) : (
									<PersonIcon sx={{ fontSize: 18 }} />
								)
							}
							onClick={() => router.push('/profile')}
							sx={{
								bgcolor: isProfile ? (isAdmin ? '#9333ea' : '#3b82f6') : 'transparent',
								borderColor: isAdmin ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.15)',
								color: isProfile ? '#ffffff' : isAdmin ? '#c084fc' : 'text.secondary',
								px: 2,
								borderRadius: 1.5,
								'&:hover': {
									borderColor: isAdmin ? '#a855f7' : '#3b82f6',
								},
							}}
						>
							{isAdmin ? 'Panel Admina' : 'Profil'}
						</Button>

						{/* Dedykowany slot autoryzacji zapobiegający przesunięciom CLS */}
						<AuthButtonSlot />
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
