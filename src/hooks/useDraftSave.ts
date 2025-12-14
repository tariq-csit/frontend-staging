import { useEffect, useRef, useCallback } from 'react';

export interface DraftData {
  formData: Record<string, any>;
  hosts?: string[];
  timestamp: number;
  pentestId: string;
  mode: 'create' | 'edit';
}

const DRAFT_PREFIX = 'vulnerability_draft_';
const DRAFT_EXPIRY_DAYS = 7; // Drafts expire after 7 days

/**
 * Get localStorage key for draft
 */
function getDraftKey(pentestId: string, mode: 'create' | 'edit'): string {
  return `${DRAFT_PREFIX}${pentestId}_${mode}`;
}

/**
 * Save draft to localStorage
 */
export function saveDraft(
  pentestId: string,
  mode: 'create' | 'edit',
  formData: Record<string, any>,
  hosts?: string[]
): void {
  if (!pentestId) return;

  try {
    const draft: DraftData = {
      formData,
      hosts,
      timestamp: Date.now(),
      pentestId,
      mode,
    };

    const key = getDraftKey(pentestId, mode);
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
    // localStorage might be full or disabled
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(
  pentestId: string,
  mode: 'create' | 'edit'
): DraftData | null {
  if (!pentestId) return null;

  try {
    const key = getDraftKey(pentestId, mode);
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const draft: DraftData = JSON.parse(stored);

    // Check if draft is expired
    const now = Date.now();
    const draftAge = now - draft.timestamp;
    const expiryMs = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (draftAge > expiryMs) {
      // Draft expired, remove it
      localStorage.removeItem(key);
      return null;
    }

    // Verify pentestId matches
    if (draft.pentestId !== pentestId || draft.mode !== mode) {
      return null;
    }

    return draft;
  } catch (error) {
    console.warn('Failed to load draft from localStorage:', error);
    return null;
  }
}

/**
 * Delete draft from localStorage
 */
export function deleteDraft(pentestId: string, mode: 'create' | 'edit'): void {
  if (!pentestId) return;

  try {
    const key = getDraftKey(pentestId, mode);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to delete draft from localStorage:', error);
  }
}

/**
 * Clear all vulnerability drafts from localStorage
 * Should be called on logout for security/privacy
 */
export function clearAllDrafts(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all draft keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear all drafts from localStorage:', error);
  }
}

/**
 * Hook for auto-saving drafts with debouncing
 */
export function useDraftSave(
  pentestId: string | undefined,
  mode: 'create' | 'edit',
  formData: Record<string, any>,
  hosts?: string[],
  enabled: boolean = true,
  debounceMs: number = 3000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Save draft function
  const saveDraftNow = useCallback(() => {
    if (!pentestId || !enabled) return;

    const currentData = JSON.stringify({ formData, hosts });
    
    // Only save if data has changed
    if (currentData === lastSavedRef.current) return;

    saveDraft(pentestId, mode, formData, hosts);
    lastSavedRef.current = currentData;
  }, [pentestId, mode, formData, hosts, enabled]);

  // Debounced save
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraftNow();
    }, debounceMs);
  }, [saveDraftNow, debounceMs]);

  // Auto-save when form data changes
  useEffect(() => {
    if (!pentestId || !enabled) return;

    debouncedSave();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, hosts, pentestId, enabled, debouncedSave]);

  // Save immediately on unmount (before tab close)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveDraftNow();
    };
  }, [saveDraftNow]);

  return { saveDraftNow };
}

/**
 * Hook for handling beforeunload event (tab close warning)
 */
export function useBeforeUnload(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages for security
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

