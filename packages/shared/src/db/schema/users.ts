import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { userRoleEnum } from '../../models';

export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  phoneNumber: text('phone_number').unique(),
  email: text('email').unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: userRoleEnum.options as [string, ...string[]] }).notNull().default('customer'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  phoneIdx: index('users_phone_idx').on(table.phoneNumber),
  emailIdx: index('users_email_idx').on(table.email),
}));
