import { Button } from "@/components/ui/button";
import { apiRoutes } from "@/lib/routes";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, QrCode, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/AxiosInstance";

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function QrCodeAuth(props: {
  qrCode: string;
  tempToken: string;
  settoken: (token: string) => void;
}) {
  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const verify2FaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof pinSchema>) => {
      const response = await axiosInstance.post(
        apiRoutes.setup2FaVerify,
        { token: data.pin },
        {
          headers: {
            Authorization: `Bearer ${props.tempToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      props.settoken(data.token);
      localStorage.setItem("token", data.token);
      toast({
        title: "2FA Setup Complete",
        description: "Your account is now secured with two-factor authentication",
      });
    },
    onError: (error) => {
      console.error("Error verifying 2FA:", error);
      toast({
        title: "Invalid Code",
        description: "Please make sure you entered the correct code from your authenticator app",
        variant: "destructive",
      });
      pinForm.reset();
    },
  });

  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-8 max-w-xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Scan QR Code
          </CardTitle>
          <CardDescription>
            Scan this QR code with your authenticator app to complete 2FA setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img
                src={props.qrCode}
                alt="2FA QR Code"
                className="w-64 h-64 object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              After scanning, enter the 6-digit code from your authenticator app below
            </p>
          </div>

          <Form {...pinForm}>
            <form onSubmit={pinForm.handleSubmit((data) => verify2FaMutation.mutate(data))} className="space-y-6">
              <FormField
                control={pinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={verify2FaMutation.isPending}
              >
                {verify2FaMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Complete Setup"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default QrCodeAuth;
