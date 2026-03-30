/**
 * packages/shared/src/index.ts
 *
 * Root barrel export for the @nummygo/shared package.
 * This is what consumers get when they `import from '@nummygo/shared'`.
 *
 * Sub-path imports (e.g. '@nummygo/shared/ui') are defined in package.json
 * "exports" and are preferred for tree-shaking.
 */

// Domain types
export * from './types';

// Zod schemas + inferred types
export * from './schemas';
