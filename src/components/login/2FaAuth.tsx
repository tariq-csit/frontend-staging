import { apiRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Loader2, Smartphone } from "lucide-react";
import axiosInstance from "@/lib/AxiosInstance";

function TwoFaAuth(props: {
  tempToken: string;
  setqrCode: Function;
  setsetupKey: Function;
}) {
  const setup2FaMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        apiRoutes.twoFa,
        {},
        {
          headers: {
            Authorization: `Bearer ${props.tempToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      props.setqrCode(data.qrCodeUrl);
      props.setsetupKey(data.secret);
      toast({
        title: "2FA Setup Ready",
        description: "Please scan the QR code with your authenticator app",
      });
    },
    onError: (error) => {
      console.error("Error setting up 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left side - Abstract ellipses background */}
      <div className="hidden md:flex border-r border-gray-200 dark:border-white/10 md:w-1/2 bg-gray-50 dark:bg-black p-8 flex-col justify-between relative overflow-hidden">
        {/* Blurred ellipses background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl opacity-10 dark:opacity-30"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
          <div className="absolute bottom-32 left-10 w-72 h-72 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-25"></div>
          <div className="absolute bottom-10 right-32 w-64 h-64 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-2 text-gray-800 dark:text-white">
        </div>
        <div className="relative z-10 text-gray-800 dark:text-white max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-2">
            <img src="/logo-large.png" alt="Slash Logo" className="h-20 dark:invert" />
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/80 mb-8">
            Secure your account with two-factor authentication for enhanced protection.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - 2FA Setup Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Smartphone Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Smartphone className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Two-Factor Authentication Setup</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enhance your account security by setting up two-factor authentication</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Follow these steps to set up 2FA:</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li>Download an authenticator app if you haven't already:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline">Google Authenticator (Android)</a></li>
                    <li><a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline">Google Authenticator (iOS)</a></li>
                    <li><a href="https://authy.com/download/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline">Authy (All platforms)</a></li>
                  </ul>
                </li>
                <li>Click the button below to generate your unique QR code</li>
                <li>Scan the QR code with your authenticator app</li>
                <li>Enter the 6-digit code from your authenticator app to complete setup</li>
              </ol>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4"
              onClick={() => setup2FaMutation.mutate()}
              disabled={setup2FaMutation.isPending}
            >
              {setup2FaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFaAuth;
