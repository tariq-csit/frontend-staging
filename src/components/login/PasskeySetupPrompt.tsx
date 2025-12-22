import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { getUserPasskeys } from '@/lib/authService';

interface PasskeySetupPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupClick: () => void;
}

const PASSKEY_SETUP_DISMISSED_KEY = 'passkeySetupDismissed';
const DISMISS_EXPIRY_DAYS = 7;

/**
 * Check if the passkey setup prompt was dismissed within the expiry period
 */
function isPasskeySetupDismissed(): boolean {
  const dismissedAt = localStorage.getItem(PASSKEY_SETUP_DISMISSED_KEY);
  if (!dismissedAt) return false;

  const dismissedTimestamp = parseInt(dismissedAt, 10);
  const now = Date.now();
  const daysSinceDismissed = (now - dismissedTimestamp) / (1000 * 60 * 60 * 24);

  // If more than 7 days have passed, clear the dismissal
  if (daysSinceDismissed > DISMISS_EXPIRY_DAYS) {
    localStorage.removeItem(PASSKEY_SETUP_DISMISSED_KEY);
    return false;
  }

  return true;
}

/**
 * Mark the passkey setup prompt as dismissed
 */
function dismissPasskeySetupPrompt(): void {
  localStorage.setItem(PASSKEY_SETUP_DISMISSED_KEY, Date.now().toString());
}

export function PasskeySetupPrompt({ open, onOpenChange, onSetupClick }: PasskeySetupPromptProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasPasskeys, setHasPasskeys] = useState(false);

  useEffect(() => {
    // Check if user has passkeys
    const checkPasskeys = async () => {
      try {
        const passkeys = await getUserPasskeys();
        setHasPasskeys(passkeys.length > 0);
      } catch (error) {
        // If error, assume no passkeys
        setHasPasskeys(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (open) {
      checkPasskeys();
    }
  }, [open]);

  // Don't show if checking or user already has passkeys or was dismissed
  const shouldShow = open && !isChecking && !hasPasskeys && !isPasskeySetupDismissed();

  const handleDismiss = () => {
    dismissPasskeySetupPrompt();
    onOpenChange(false);
  };

  const handleSetup = () => {
    onSetupClick();
    onOpenChange(false);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold dark:text-gray-100">
            Set up Passkey for Faster Login
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
            Enhance your account security with passkey authentication. Log in quickly without passwords or OTP codes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No password needed</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Use your device's biometric authentication</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">More secure</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Protected by your device's security features</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Faster login</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Skip 2FA codes and get instant access</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleSetup}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
          >
            Set up Passkey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

