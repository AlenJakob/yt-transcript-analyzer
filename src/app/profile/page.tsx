import { Container, Box } from '@mui/material';
import Header from '@/components/Header';
import ProfileView from '@/components/ProfileView';
import { createClerkClient } from '@clerk/nextjs/server';
import { formatClerkUser, FormattedAdminUser } from '@/utils/helper';
import { verifyAdminAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function ProfilePage() {
	let initialUsers: FormattedAdminUser[] = [];
	const { isAdmin } = await verifyAdminAccess();

	if (isAdmin) {
		try {
			const response = await clerkClient.users.getUserList({
				limit: 50,
				orderBy: '-created_at',
			});
			initialUsers = response.data.map((user) => formatClerkUser(user));
		} catch (err) {
			console.error('[ProfilePage SSR] Error fetching admin users:', err);
		}
	}

	return (
		<Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
			<Header />
			<Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
				<ProfileView initialUsers={initialUsers} />
			</Container>
		</Box>
	);
}
