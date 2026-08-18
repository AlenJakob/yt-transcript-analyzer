'use client';

import { Grid, Card, Skeleton } from '@mui/material';

export default function ArchiveSkeleton() {
	return (
		<Grid container spacing={2.5}>
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
					<Card
						sx={{
							height: '100%',
							bgcolor: '#121824',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 2,
							p: 2.5,
						}}
					>
						<Skeleton
							variant="rectangular"
							width="100%"
							height={150}
							sx={{ borderRadius: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.06)' }}
						/>
						<Skeleton
							variant="text"
							width="85%"
							height={24}
							sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)' }}
						/>
						<Skeleton
							variant="text"
							width="60%"
							height={20}
							sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.06)' }}
						/>
						<Skeleton
							variant="rectangular"
							width="45%"
							height={30}
							sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.06)' }}
						/>
					</Card>
				</Grid>
			))}
		</Grid>
	);
}
