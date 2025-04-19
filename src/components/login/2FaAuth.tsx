import { apiRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Loader2, Smartphone } from "lucide-react";
import axiosInstance from "@/lib/AxiosInstance";

function TwoFaAuth(props: {
  tempToken: string;
  setqrCode: Function;
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
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-8 max-w-xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Two-Factor Authentication Setup
          </CardTitle>
          <CardDescription>
            Enhance your account security by setting up two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Follow these steps to set up 2FA:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Download an authenticator app if you haven't already:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Authenticator (Android)</a></li>
                  <li><a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Authenticator (iOS)</a></li>
                  <li><a href="https://authy.com/download/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Authy (All platforms)</a></li>
                </ul>
              </li>
              <li>Click the button below to generate your unique QR code</li>
              <li>Scan the QR code with your authenticator app</li>
              <li>Enter the 6-digit code from your authenticator app to complete setup</li>
            </ol>
          </div>

          <Button
            className="w-full"
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
        </CardContent>
      </Card>
    </div>
  );
}

export default TwoFaAuth;
