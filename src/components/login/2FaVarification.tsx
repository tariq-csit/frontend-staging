import { Button } from '@/components/ui/button'
import { apiRoutes } from '@/lib/routes';
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, Shield } from 'lucide-react';
import axiosInstance from '@/lib/AxiosInstance';
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useEffect } from 'react';

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function TwoFaVarification(props:{
  varificationToken: string,
  email: string
}) {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have the necessary authentication state
    if (!props.varificationToken || !props.email) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to complete authentication.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [props.varificationToken, props.email, navigate]);

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const verify2FaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof pinSchema>) => {
      const response = await axiosInstance.post(
        apiRoutes.verify2Fa,
        {'token': data.pin},
        {
          headers: {
            Authorization: `Bearer ${props.varificationToken}`,
          },
        }
      );
      console.log(response.data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast({
        title: "Success",
        description: "2FA verification successful!",
      });
      navigate('/dashboard');
      pinForm.reset();
    },
    onError: (error) => {
      console.error("Error verifying 2FA:", error);
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      pinForm.reset();
    },
  });

  function onSubmit(data: z.infer<typeof pinSchema>) {
    verify2FaMutation.mutate(data);
  }

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
            Almost there! Complete your authentication to access your dashboard.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2025 Slash
        </div>
      </div>

      {/* Right side - 2FA Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Authentication Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Authenticate Your Account</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enter the 6-digit code from your authenticator app</p>
            </div>

            {/* Form */}
            <Form {...pinForm}>
              <form onSubmit={pinForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={pinForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                              <InputOTPSlot index={1} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                              <InputOTPSlot index={2} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                              <InputOTPSlot index={3} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                              <InputOTPSlot index={4} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                              <InputOTPSlot index={5} className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 text-center" />
                    </FormItem>
                  )}
                />
                
                <FormDescription className="text-gray-600 dark:text-gray-400 text-sm text-center">
                  <p>If you want to reset your 2FA setup contact support@securitywall.co</p>
                </FormDescription>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4" 
                  disabled={verify2FaMutation.isPending}
                >
                  {verify2FaMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFaVarification
