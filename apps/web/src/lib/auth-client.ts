import { createAuthClient } from 'better-auth/react';
import { authConfig } from './auth-config';

export const authClient = createAuthClient(authConfig);
