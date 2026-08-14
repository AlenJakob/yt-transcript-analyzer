'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';

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

export function useAdminUsers() {
	const userAuth = useAuthUser();

	const [users, setUsers] = useState<AdminUser[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
	const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

	const fetchAdminUsers = useCallback(async () => {
		if (!userAuth.isAdmin) return;
		try {
			setIsLoadingUsers(true);
			const res = await fetch('/api/admin/users');
			const data = await res.json();
			if (res.ok && data.users) {
				setUsers(data.users);
			} else {
				console.error('Błąd pobierania użytkowników:', data.error);
			}
		} catch (err) {
			console.error('Błąd sieci admin users:', err);
		} finally {
			setIsLoadingUsers(false);
		}
	}, [userAuth.isAdmin]);

	useEffect(() => {
		if (userAuth.isAdmin) {
			fetchAdminUsers();
		}
	}, [userAuth.isAdmin, fetchAdminUsers]);

	const handleUpdateUser = async (targetUserId: string, newTier?: string, newRole?: string) => {
		try {
			setUpdatingUserId(targetUserId);
			const res = await fetch('/api/admin/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
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
			(u) =>
				u.email.toLowerCase().includes(query) ||
				`${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
		);

		return [...filtered].sort((a, b) => {
			if (a.id === userAuth.userId) return -1;
			if (b.id === userAuth.userId) return 1;
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
