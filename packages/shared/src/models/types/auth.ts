import {UserRole} from "../enums";

// Define the additional user fields that extend Better Auth's base user
export interface UserAdditionalFields {
    role: UserRole;
    phoneNumber: string | null;
}
