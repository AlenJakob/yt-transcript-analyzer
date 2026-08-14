import { getCookie } from '@/utils/helper';
import { useEffect, useState, startTransition } from 'react';

export const useFakeAuth = () => {
	const [isAllowed, setIsAllowed] = useState(false);

	useEffect(() => {
		const testCookie = getCookie('test');
		if (testCookie === 'alen') {
			startTransition(() => {
				setIsAllowed(true);
			});
		}
	}, []);

	return {
		isAllowed,
	};
};
