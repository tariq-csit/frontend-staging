import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  startPasskeyRegistration,
  completePasskeyRegistration,
  transformOptionsForWebAuthn,
  isWebAuthnSupported,
} from '@/lib/authService';
import { useQueryClient } from '@tanstack/react-query';

const deviceNameSchema = z.object({
  deviceName: z
    .string()
    .min(1, 'Device name is required')
    .max(50, 'Device name must be 50 characters or less')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Device name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
});

interface PasskeyRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasskeyRegistrationDialog({
  open,
  onOpenChange,
}: PasskeyRegistrationDialogProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof deviceNameSchema>>({
    resolver: zodResolver(deviceNameSchema),
    defaultValues: {
      deviceName: '',
    },
  });

  const handleRegister = async (values: z.infer<typeof deviceNameSchema>) => {
    if (!isWebAuthnSupported()) {
      toast({
        title: 'Not Supported',
        description: 'Passkeys are not supported in your browser. Please use a modern browser with WebAuthn support.',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);

    try {
      // Step 1: Start registration
      const { options, challengeKey } = await startPasskeyRegistration(values.deviceName);

      // Step 2: Transform options for WebAuthn API
      const transformedOptions = transformOptionsForWebAuthn(options);

      // Step 3: Create credential using browser WebAuthn API
      const attestation = (await navigator.credentials.create({
        publicKey: transformedOptions as PublicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!attestation) {
        throw new Error('Failed to create passkey');
      }

      // Step 4: Complete registration
      await completePasskeyRegistration({
        challengeKey,
        attestation,
      });

      // Success!
      toast({
        title: 'Success',
        description: 'Passkey registered successfully! You can now use it to log in.',
      });

      // Invalidate passkeys query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['passkeys'] });

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Passkey registration error:', error);

      // Handle user cancellation
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        toast({
          title: 'Registration Cancelled',
          description: 'Passkey registration was cancelled. You can try again anytime.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Failed to register passkey. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold dark:text-gray-100">
            Register a New Passkey
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
            Choose a name for this device to help you identify it later (e.g., "iPhone 15", "MacBook Pro").
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Device Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., iPhone 15, MacBook Pro, Windows PC"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      disabled={isRegistering}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage className="dark:text-red-400" />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isRegistering}
                className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Passkey'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

