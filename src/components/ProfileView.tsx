'use client';

import {
	Paper,
	Box,
	Typography,
	Button,
	Chip,
	Stack,
	Avatar,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	TextField,
	InputAdornment,
	Alert,
	Snackbar,
	Tooltip,
	IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useAuthUser } from '@/hooks/useAuthUser';
import { AdminUser, useAdminUsers } from '@/hooks/useAdminUsers';
import { useClerk } from '@clerk/nextjs';

interface ProfileViewProps {
	initialUsers?: AdminUser[];
}

export default function ProfileView({ initialUsers = [] }: ProfileViewProps) {
	const userAuth = useAuthUser();
	const { openSignIn } = useClerk();

	const {
		users: filteredUsers,
		isLoadingUsers,
		searchQuery,
		setSearchQuery,
		updatingUserId,
		snackbarMsg,
		setSnackbarMsg,
		fetchAdminUsers,
		handleUpdateUser,
	} = useAdminUsers(initialUsers);

	if (!userAuth.isSignedIn && userAuth.isLoaded) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: { xs: 4, sm: 6 },
					textAlign: 'center',
					bgcolor: '#121824',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					borderRadius: 2,
					maxWidth: 600,
					mx: 'auto',
					my: 4,
				}}
			>
				<PersonIcon sx={{ fontSize: 56, color: '#3b82f6', mb: 2 }} />
				<Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
					Zaloguj się, aby zobaczyć profil
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
					Zalogowani użytkownicy mają dostęp do historii transkrypcji, statystyk konta i wyższych
					limitów AI.
				</Typography>
				<Button
					variant="contained"
					onClick={() => openSignIn()}
					sx={{ px: 4, py: 1, borderRadius: 2 }}
				>
					Zaloguj się teraz
				</Button>
			</Paper>
		);
	}

	return (
		<Box sx={{ maxWidth: 1100, mx: 'auto', mb: 6 }}>
			{/* Karta Profilu Użytkownika */}
			<Paper
				elevation={0}
				sx={{
					p: { xs: 3, sm: 4 },
					bgcolor: '#121824',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					borderRadius: 2,
					mb: 4,
				}}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={3}
					sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
				>
					<Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
						<Avatar
							src={userAuth.imageUrl || undefined}
							alt={userAuth.fullName || 'User Avatar'}
							sx={{
								width: 72,
								height: 72,
								bgcolor: '#3b82f6',
								fontSize: '1.8rem',
								fontWeight: 700,
							}}
						>
							{userAuth.fullName?.[0] || userAuth.userEmail?.[0] || 'U'}
						</Avatar>
						<Box>
							<Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
								<Typography variant="h5" sx={{ fontWeight: 700 }}>
									{userAuth.fullName || 'Użytkownik'}
								</Typography>
								{userAuth.isAdmin && (
									<Chip
										icon={<AdminPanelSettingsIcon sx={{ fontSize: 15 }} />}
										label="Administrator"
										color="secondary"
										size="small"
										sx={{ fontWeight: 700, borderRadius: 2 }}
									/>
								)}
								{userAuth.isPro && !userAuth.isAdmin && (
									<Chip
										icon={<StarIcon sx={{ fontSize: 15 }} />}
										label="Plan PRO"
										color="success"
										size="small"
										sx={{ fontWeight: 700, borderRadius: 2 }}
									/>
								)}
								{!userAuth.isPro && !userAuth.isAdmin && (
									<Chip
										label="Basic (Darmowy)"
										variant="outlined"
										size="small"
										sx={{
											color: 'text.secondary',
											borderColor: 'rgba(255, 255, 255, 0.2)',
											borderRadius: 2,
										}}
									/>
								)}
							</Stack>
							<Typography variant="body2" sx={{ color: 'text.secondary' }}>
								{userAuth.userEmail || 'Brak powiązanego adresu email'}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}
							>
								User ID: {userAuth.userId}
							</Typography>
						</Box>
					</Stack>

					<Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
						>
							Twój aktywny pakiet
						</Typography>
						<Chip
							icon={
								userAuth.isPro || userAuth.isAdmin ? <WorkspacePremiumIcon /> : <CheckCircleIcon />
							}
							label={
								userAuth.isAdmin
									? 'Dostęp Pełny (Admin)'
									: userAuth.isPro
										? 'Plan PRO (Bez limitów)'
										: 'Plan Basic'
							}
							sx={{
								px: 1.5,
								py: 2.2,
								fontSize: '0.9rem',
								fontWeight: 700,
								bgcolor: userAuth.isAdmin
									? 'rgba(168, 85, 247, 0.15)'
									: userAuth.isPro
										? 'rgba(16, 185, 129, 0.15)'
										: 'rgba(59, 130, 246, 0.15)',
								color: userAuth.isAdmin ? '#c084fc' : userAuth.isPro ? '#34d399' : '#60a5fa',
								border: '1px solid rgba(255, 255, 255, 0.1)',
								borderRadius: 2,
							}}
						/>
					</Box>
				</Stack>
			</Paper>

			{/* PANEL ADMINISTRATORA (Dla kont z uprawnieniami Admina) */}
			{userAuth.isAdmin && (
				<Paper
					elevation={0}
					sx={{
						p: { xs: 3, sm: 4 },
						bgcolor: '#121824',
						border: '1px solid rgba(168, 85, 247, 0.3)',
						borderRadius: 2,
					}}
				>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
					>
						<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
							<AdminPanelSettingsIcon sx={{ color: '#c084fc', fontSize: 32 }} />
							<Box>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									Panel Zarządzania Użytkownikami (Admin)
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary' }}>
									Przeglądaj zarejestrowane konta i przyznawaj pakiety PRO lub rolę Admina.
								</Typography>
							</Box>
						</Stack>

						<Stack direction="row" spacing={1.5}>
							<TextField
								size="small"
								placeholder="Szukaj użytkownika..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								sx={{ width: { xs: '100%', sm: 220 } }}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
											</InputAdornment>
										),
									},
								}}
							/>
							<Tooltip title="Odśwież listę">
								<IconButton onClick={fetchAdminUsers} disabled={isLoadingUsers} color="primary">
									<RefreshIcon />
								</IconButton>
							</Tooltip>
						</Stack>
					</Stack>

					<Divider sx={{ mb: 3 }} />

					{isLoadingUsers ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress size={32} />
						</Box>
					) : filteredUsers.length === 0 ? (
						<Alert severity="info" sx={{ borderRadius: 2 }}>
							Brak zarejestrowanych użytkowników spełniających kryteria wyszukiwania.
						</Alert>
					) : (
						<TableContainer
							component={Paper}
							elevation={0}
							sx={{
								bgcolor: 'transparent',
								border: '1px solid rgba(255, 255, 255, 0.08)',
								borderRadius: 2,
							}}
						>
							<Table size="small">
								<TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
									<TableRow>
										<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
											Użytkownik
										</TableCell>
										<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
											Pakiet (Tier)
										</TableCell>
										<TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Rola</TableCell>
										<TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700 }}>
											Akcje Zarządzania
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredUsers.map((user) => {
										const isUserPro = user.tier === 'pro';
										const isUserAdmin = user.role === 'admin';
										const isUpdating = updatingUserId === user.id;
										const isSelf = user.id === userAuth.userId;

										return (
											<TableRow
												key={user.id}
												hover
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell>
													<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
														<Avatar src={user.imageUrl} sx={{ width: 32, height: 32 }}>
															{user.firstName?.[0] || user.email[0]}
														</Avatar>
														<Box>
															<Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
																<Typography variant="body2" sx={{ fontWeight: 600 }}>
																	{user.firstName || user.lastName
																		? `${user.firstName} ${user.lastName}`.trim()
																		: user.email}
																</Typography>
																{isSelf && (
																	<Chip
																		label="Ty"
																		size="small"
																		color="primary"
																		variant="outlined"
																		sx={{
																			height: 18,
																			fontSize: '0.65rem',
																			fontWeight: 700,
																			borderRadius: 1,
																		}}
																	/>
																)}
															</Stack>
															<Typography
																variant="caption"
																sx={{ color: 'text.secondary', display: 'block' }}
															>
																{user.email}
															</Typography>
														</Box>
													</Stack>
												</TableCell>
												<TableCell>
													{isUserPro ? (
														<Chip
															label="PRO"
															color="success"
															size="small"
															sx={{ fontWeight: 700, borderRadius: 2 }}
														/>
													) : (
														<Chip
															label="Basic"
															variant="outlined"
															size="small"
															sx={{ borderRadius: 2 }}
														/>
													)}
												</TableCell>
												<TableCell>
													{isUserAdmin ? (
														<Chip
															label="ADMIN"
															color="secondary"
															size="small"
															sx={{ fontWeight: 700, borderRadius: 2 }}
														/>
													) : (
														<Typography variant="caption" sx={{ color: 'text.secondary' }}>
															User
														</Typography>
													)}
												</TableCell>
												<TableCell align="right">
													<Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
														{/* Przełącznik PRO */}
														<Tooltip
															title={
																isSelf && isUserPro
																	? 'Nie możesz odebrać sobie pakietu PRO z poziomu panelu'
																	: ''
															}
														>
															<span>
																<Button
																	size="small"
																	variant={isUserPro ? 'outlined' : 'contained'}
																	color={isUserPro ? 'inherit' : 'success'}
																	disabled={isUpdating || (isSelf && isUserPro)}
																	onClick={() =>
																		handleUpdateUser(
																			user.id,
																			isUserPro ? 'free' : 'pro',
																			undefined
																		)
																	}
																	sx={{ fontSize: '0.75rem', px: 1.5, py: 0.3, borderRadius: 2 }}
																>
																	{isUpdating ? (
																		<CircularProgress size={12} />
																	) : isUserPro ? (
																		'Cofnij PRO'
																	) : (
																		'Nadaj PRO'
																	)}
																</Button>
															</span>
														</Tooltip>

														{/* Przełącznik ADMIN */}
														<Tooltip
															title={
																isSelf && isUserAdmin
																	? 'Nie możesz odebrać sobie uprawnień Admina z poziomu panelu'
																	: ''
															}
														>
															<span>
																<Button
																	size="small"
																	variant={isUserAdmin ? 'outlined' : 'contained'}
																	color={isUserAdmin ? 'inherit' : 'secondary'}
																	disabled={isUpdating || (isSelf && isUserAdmin)}
																	onClick={() =>
																		handleUpdateUser(
																			user.id,
																			undefined,
																			isUserAdmin ? 'user' : 'admin'
																		)
																	}
																	sx={{ fontSize: '0.75rem', px: 1.5, py: 0.3, borderRadius: 2 }}
																>
																	{isUpdating ? (
																		<CircularProgress size={12} />
																	) : isUserAdmin ? (
																		'Cofnij Admina'
																	) : (
																		'Nadaj Admina'
																	)}
																</Button>
															</span>
														</Tooltip>
													</Stack>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</Paper>
			)}

			<Snackbar
				open={Boolean(snackbarMsg)}
				autoHideDuration={4000}
				onClose={() => setSnackbarMsg(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity="success" onClose={() => setSnackbarMsg(null)} sx={{ borderRadius: 2 }}>
					{snackbarMsg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
