/**
 * useModificationMode
 *
 * Stores and retrieves the "modification mode" context in sessionStorage so
 * that both VendorStorefront and CartDrawer can read it independently without
 * prop drilling.
 *
 * Shape:
 *   { orderId, sessionId }
 *
 * orderId   — the order the customer wants to modify
 * sessionId — the checkout session to redirect back to after submission
 */

const KEY = 'nummygo-mod-mode';

export interface ModificationMode {
  orderId: string;
  sessionId: string;
}

/** Read the current modification mode (if any). */
export function getModificationMode(): ModificationMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ModificationMode;
  } catch {
    return null;
  }
}

/** Activate modification mode. Persists to sessionStorage. */
export function setModificationMode(mode: ModificationMode): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(mode));
}

/** Clear modification mode (called after submit or cancel). */
export function clearModificationMode(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}

import { useState, useEffect } from 'react';

/** React hook — returns current mod mode and a setter. Reactive. */
export function useModificationMode() {
  const [mode, setMode] = useState<ModificationMode | null>(null);

  useEffect(() => {
    // Read on mount (client-only)
    setMode(getModificationMode());

    // Listen for changes from other components in the same tab
    const handler = () => setMode(getModificationMode());
    window.addEventListener('nummygo:mod-mode-changed', handler);
    return () => window.removeEventListener('nummygo:mod-mode-changed', handler);
  }, []);

  const activate = (m: ModificationMode) => {
    setModificationMode(m);
    setMode(m);
    window.dispatchEvent(new Event('nummygo:mod-mode-changed'));
  };

  const deactivate = () => {
    clearModificationMode();
    setMode(null);
    window.dispatchEvent(new Event('nummygo:mod-mode-changed'));
  };

  return { mode, isActive: mode !== null, activate, deactivate };
}
