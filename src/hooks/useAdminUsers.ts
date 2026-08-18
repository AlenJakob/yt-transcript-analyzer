'use client';

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useAuth } from '@clerk/nextjs';

export interface AdminUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	imageUrl: string;
	createdAt: number;
	tier: string;
	role: string;
}

export function useAdminUsers(initialUsers: AdminUser[] = []) {
	const userAuth = useAuthUser();
	const { getToken, isLoaded, isSignedIn, userId } = useAuth();

	console.log('[useAdminUsers Hook Full Debug]', {
		isLoaded,
		isSignedIn,
		userId,
		userAuthIsAdmin: userAuth.isAdmin,
	});

	const [users, setUsers] = useState<AdminUser[]>(initialUsers);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
	const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

	useEffect(() => {
		if (initialUsers && initialUsers.length > 0) {
			startTransition(() => {
				setUsers(initialUsers);
			});
		}
	}, [initialUsers]);

	const fetchAdminUsers = useCallback(async () => {
		if (!userAuth.isLoaded || !userAuth.isSignedIn || !userAuth.isAdmin) {
			return;
		}
		try {
			setIsLoadingUsers(true);
			const token = await getToken();
			console.log('[/api/admin/users Client token prefix]:', token ? token.slice(0, 25) : 'NULL');
			const headers: Record<string, string> = {};
			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}
			const res = await fetch('/api/admin/users', { credentials: 'include', headers });
			const data = await res.json();
			console.log('[/api/admin/users Response]:', data);
			if (res.ok && data.users) {
				startTransition(() => {
					setUsers(data.users);
				});
			} else {
				console.error('Błąd pobierania użytkowników:', data.error);
			}
		} catch (err) {
			console.error('Błąd sieci admin users:', err);
		} finally {
			setIsLoadingUsers(false);
		}
	}, [userAuth.isLoaded, userAuth.isSignedIn, userAuth.isAdmin, getToken]);

	useEffect(() => {
		if (userAuth.isLoaded && userAuth.isSignedIn && userAuth.isAdmin && users.length === 0) {
			startTransition(() => {
				fetchAdminUsers();
			});
		}
	}, [userAuth.isLoaded, userAuth.isSignedIn, userAuth.isAdmin, users.length, fetchAdminUsers]);

	const handleUpdateUser = async (targetUserId: string, newTier?: string, newRole?: string) => {
		try {
			setUpdatingUserId(targetUserId);
			const token = await getToken();
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
			};
			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}
			const res = await fetch('/api/admin/users', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					targetUserId,
					tier: newTier,
					role: newRole,
				}),
			});

			const data = await res.json();
			if (res.ok) {
				setSnackbarMsg(
					`Zaktualizowano uprawnienia użytkownika! ${newTier ? `Pakiet: ${newTier.toUpperCase()}` : ''} ${newRole ? `Rola: ${newRole.toUpperCase()}` : ''}`
				);
				await fetchAdminUsers();
			} else {
				alert(`Błąd: ${data.error}`);
			}
		} catch (err) {
			console.error('Błąd aktualizacji uprawnień:', err);
		} finally {
			setUpdatingUserId(null);
		}
	};

	const filteredUsers = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		const filtered = users.filter(
			(user) =>
				user.email.toLowerCase().includes(query) ||
				`${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
		);

		return [...filtered].sort((a, b) => {
			if (a.id === userAuth.userId) {
				return -1;
			}
			if (b.id === userAuth.userId) {
				return 1;
			}
			return 0;
		});
	}, [users, searchQuery, userAuth.userId]);

	return {
		users: filteredUsers,
		totalUsersCount: users.length,
		isLoadingUsers,
		searchQuery,
		setSearchQuery,
		updatingUserId,
		snackbarMsg,
		setSnackbarMsg,
		fetchAdminUsers,
		handleUpdateUser,
	};
}
