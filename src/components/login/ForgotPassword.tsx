import { apiRoutes } from "@/lib/routes";
import { Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Turnstile, { useTurnstile } from "react-turnstile";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .min(2),
});

function ForgotPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstile = useTurnstile();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await axiosInstance.post(apiRoutes.forgotPassword, {
        email: values.email,
        "cf-turnstile-response": turnstileToken,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset link has been sent to your email!",
      });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        turnstile.reset();
        form.reset();
        toast({
          title: "Error",
          description: error.response.data.message || "Failed to send reset link. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    forgotPasswordMutation.mutate(values);
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
            Reset your password to regain access to your account.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Mail Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Mail className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your email address and we'll send you a link to reset your password</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email..."
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Turnstile Widget */}
                <Turnstile
                  sitekey="0x4AAAAAABAY4zDtElrDH2g0"
                  onVerify={(token) => setTurnstileToken(token)}
                  className="w-full"
                />

                {/* Submit Button */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4" 
                  type="submit"
                  disabled={forgotPasswordMutation.isPending || !turnstileToken}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                {/* Sign In Link */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary hover:text-primary/80 hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
