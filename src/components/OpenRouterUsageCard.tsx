'use client';

import {
	Paper,
	Box,
	Typography,
	Stack,
	Chip,
	IconButton,
	Tooltip,
	CircularProgress,
	Alert,
	Grid,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ApiIcon from '@mui/icons-material/Api';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useOpenRouterUsage } from '@/hooks/useOpenRouterUsage';

interface OpenRouterUsageCardProps {
	isAdmin: boolean;
}

export default function OpenRouterUsageCard({
	isAdmin,
}: OpenRouterUsageCardProps) {
	const { formattedInfo, isLoading, error, refreshUsage } =
		useOpenRouterUsage(isAdmin);

	if (!isAdmin) {
		return null;
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 3 },
				mb: 4,
				bgcolor: (theme) =>
					theme.palette.mode === 'dark'
						? 'rgba(59, 130, 246, 0.04)'
						: 'rgba(59, 130, 246, 0.02)',
				border: '1px solid',
				borderColor: (theme) =>
					theme.palette.mode === 'dark'
						? 'rgba(59, 130, 246, 0.25)'
						: 'rgba(59, 130, 246, 0.2)',
				borderRadius: 2,
			}}
		>
			<Stack
				direction="row"
				sx={{
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2.5,
					pb: 1.5,
					borderBottom: '1px dashed',
					borderColor: 'divider',
				}}
			>
				<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
					<ApiIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Statystyki i Zużycie OpenRouter API
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary' }}>
							Podsumowanie wykorzystania limitów konta
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
					<Chip
						label={formattedInfo.tierLabel}
						color={formattedInfo.isFreeTier ? 'info' : 'success'}
						size="small"
						sx={{ fontWeight: 700, borderRadius: 2 }}
					/>
					<Tooltip title="Odśwież statystyki zużycia">
						<IconButton
							onClick={refreshUsage}
							disabled={isLoading}
							size="small"
							color="primary"
						>
							{isLoading ? (
								<CircularProgress size={16} />
							) : (
								<RefreshIcon fontSize="small" />
							)}
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{error ? (
				<Alert severity="warning" sx={{ borderRadius: 2 }}>
					{error}
				</Alert>
			) : (
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<Box
							sx={{
								p: 2,
								borderRadius: 2,
								bgcolor: 'background.paper',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
								<AttachMoneyIcon sx={{ color: '#10b981', fontSize: 20 }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
									Wykorzystano (USD)
								</Typography>
							</Stack>
							<Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
								{formattedInfo.totalUsageUsd}
							</Typography>
						</Box>
					</Grid>

					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<Box
							sx={{
								p: 2,
								borderRadius: 2,
								bgcolor: 'background.paper',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
								<AccountBalanceWalletIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
									Szacowany koszt (PLN)
								</Typography>
							</Stack>
							<Typography variant="h6" sx={{ fontWeight: 700, color: '#60a5fa' }}>
								{formattedInfo.totalUsagePln}
							</Typography>
						</Box>
					</Grid>

					<Grid size={{ xs: 12, sm: 12, md: 4 }}>
						<Box
							sx={{
								p: 2,
								borderRadius: 2,
								bgcolor: 'background.paper',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
								<SpeedIcon sx={{ color: '#a855f7', fontSize: 20 }} />
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
									Limit Wydatków
								</Typography>
							</Stack>
							<Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7' }}>
								{formattedInfo.limitLabel}
							</Typography>
						</Box>
					</Grid>
				</Grid>
			)}
		</Paper>
	);
}
