import type { betterAuth } from 'better-auth';
import {UserRole} from "../enums";

// Define the additional user fields that extend Better Auth's base user
export interface UserAdditionalFields {
    role: UserRole;
    phoneNumber: string | null;
}

// Create a type that represents our auth instance with additional fields
// This will be used by inferAdditionalFields on the client
export type Auth = ReturnType<typeof betterAuth<{
    user: {
        additionalFields: {
            role: { type: 'string'; defaultValue: 'customer'; input: true };
            phoneNumber: { type: 'string'; unique: true };
        };
    };
}>>;
