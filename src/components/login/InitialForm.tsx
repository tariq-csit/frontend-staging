import { apiRoutes } from "@/lib/routes";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
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
  password: z.string().min(8, {
    message: "Password should be atleast 8 characters long",
  }),
});

function InitialForm(props:{
  settempToken: Function,
  setvarificationToken: (token: string)=>void,
  setEmail : (email: string)=>void
}) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstile = useTurnstile();

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await axiosInstance.post(apiRoutes.login, {
        email: values.email,
        password: values.password,
        "cf-turnstile-response": turnstileToken,
      });
      return response.data;
    },
    onSuccess: (data: any, variables) => {
      props.setvarificationToken(data.token);
      props.setEmail(variables.email);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "2FA setup required") {
          props.settempToken(error.response.data.tempToken);
        } else {
          turnstile.reset();
          form.reset();
          toast({
            title: "Error",
            description: errorMessage || "Failed to login. Please try again.",
            variant: "destructive",
          });
        }
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Abstract ellipses background */}
      <div className="hidden md:flex border-r border-white/10 dark:border-gray-800 md:w-1/2 bg-black p-8 flex-col justify-between relative overflow-hidden">
        {/* Blurred ellipses background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-primary rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-32 left-10 w-72 h-72 bg-primary rounded-full blur-3xl opacity-25"></div>
          <div className="absolute bottom-10 right-32 w-64 h-64 bg-primary rounded-full blur-3xl opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary rounded-full blur-3xl opacity-10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-2 text-white">
        </div>
        <div className="relative z-10 text-white max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-2">
            <img src="/logo-large.png" alt="Slash Logo" className="h-20 invert" />
          </h1>
          <p className="text-sm text-white/80 mb-8">
            Please sign in to streamline the management and monitoring of penetration tests.
          </p>
        </div>
        <div className="relative z-10 text-center text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 space-y-6">
            {/* User Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-full p-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400 text-sm">Please enter your information to sign in</p>
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
                      <FormLabel className="text-sm text-gray-300 font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email..."
                          className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-300 font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
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
                      <FormMessage className="text-red-400" />
                      <div className="text-right">
                        <Link
                          to="/forgot-password"
                          className="text-sm text-gray-400 hover:text-white underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Turnstile Widget */}
                <Turnstile
                  sitekey="0x4AAAAAABAY4zDtElrDH2g0"
                  onVerify={(token) => setTurnstileToken(token)}
                  className="w-full"
                />

                {/* Sign In Button */}
                <Button 
                  className="w-full bg-white text-black hover:bg-gray-200 font-medium py-4" 
                  type="submit"
                  disabled={loginMutation.isPending || !turnstileToken}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center text-sm text-gray-400">
                  Don't have an account yet?{" "}
                  <Link to="/signup" className="text-white hover:underline font-medium">
                    Sign up
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

export default InitialForm;
