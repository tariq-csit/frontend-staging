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
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

const formSchema = z.object({
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function ResetPassword() {
  const {pathname} = useLocation()
  const navigate = useNavigate();
  const resetToken = pathname.split('/').pop();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!resetToken) {
      toast({
        title: "Invalid reset link",
        description: "Please request a new password reset link",
        variant: "destructive",
      });
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await axiosInstance.post(apiRoutes.resetPassword + '/' + resetToken, {
        password: values.password,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "You can now login with your new password",
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast({
        title: "Error resetting password",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      resetPassword(values);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        console.error(error.response.data.message);
      } else {
        console.error(error);
      }
    }
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
            Create a new secure password for your account.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - Reset Password Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Lock Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Lock className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your new password below</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 dark:text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 dark:text-gray-400"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 