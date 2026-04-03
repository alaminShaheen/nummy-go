import {createAuthClient} from 'better-auth/react';
import {env} from '@/env';
import {inferAdditionalFields} from "better-auth/client/plugins";
import type {Auth} from '@nummygo/shared/models/types';

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_API_WORKER_URL,
	fetchOptions: {
		credentials: 'include',
	},
	plugins: [inferAdditionalFields<Auth>()],
});
