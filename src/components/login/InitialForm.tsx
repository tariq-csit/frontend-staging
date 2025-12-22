import { apiRoutes } from "@/lib/routes";
import { Eye, EyeOff, Loader2, User, Shield } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Turnstile, { useTurnstile } from "react-turnstile";
import {
  checkLoginMethods,
  startPasskeyLogin,
  completePasskeyLogin,
  transformOptionsForWebAuthn,
  isWebAuthnSupported,
} from "@/lib/authService";
import { startTokenRefresh } from "@/lib/AxiosInstance";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .transform((email) => {
      // Remove all Unicode whitespace and invisible characters, then trim
      return email.replace(/[\u200B-\u200D\uFEFF\u00A0\u2000-\u200A\u2028\u2029]/g, '').trim();
    })
    .refine((email) => {
      // RFC 5322 compliant email regex that properly handles special characters
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return emailRegex.test(email);
    }, {
      message: "Please enter a valid email"
    }),
  password: z.string().optional(),
}).refine((data) => {
  // Password is only required if password field is shown
  // This will be validated in the component logic
  return true;
});

function InitialForm(props:{
  settempToken: Function,
  setvarificationToken: (token: string)=>void,
  setEmail : (email: string)=>void
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [hasPasskeys, setHasPasskeys] = useState<boolean | null>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingLoginMethods, setIsCheckingLoginMethods] = useState(false);
  const [isPasskeyLogin, setIsPasskeyLogin] = useState(false);
  const { redirectTo } = useAuthRedirect();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstile = useTurnstile();
  const emailValue = form.watch("email");

  // Function to check login methods (only called explicitly via Enter or Continue button)
  const checkLoginMethodsAsync = async () => {
    // Trigger form validation first
    const isEmailValid = await form.trigger("email");
    
    if (!isEmailValid) {
      return;
    }

    const email = form.getValues("email");
    
    if (!email || !turnstileToken) {
      if (!turnstileToken) {
        toast({
          title: "Please wait",
          description: "Security verification is loading. Please wait a moment.",
          variant: "default",
        });
      }
      return;
    }

    setIsCheckingLoginMethods(true);
    try {
      const response = await checkLoginMethods(email, turnstileToken);
      setHasPasskeys(response.hasPasskeys);
      setShowPasswordField(!response.hasPasskeys);
      
      // Reset Turnstile to get a new token for the actual login
      // The previous token was consumed by check-login-methods
      if (turnstile) {
        turnstile.reset();
        setTurnstileToken(null);
      }
    } catch (error) {
      // On error, default to password login
      setHasPasskeys(false);
      setShowPasswordField(true);
      
      // Reset Turnstile even on error
      if (turnstile) {
        turnstile.reset();
        setTurnstileToken(null);
      }
    } finally {
      setIsCheckingLoginMethods(false);
    }
  };

  // Reset login method state when email changes (but don't auto-check)
  useEffect(() => {
    // Reset the state when email changes so UI resets
    setHasPasskeys(null);
    setShowPasswordField(false);
    setIsCheckingLoginMethods(false);
  }, [emailValue]);

  // Passkey login mutation
  const passkeyLoginMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!isWebAuthnSupported()) {
        throw new Error("Passkeys are not supported in your browser");
      }

      // Step 1: Start passkey login
      const { options, challengeKey } = await startPasskeyLogin(email, turnstileToken);

      // Step 2: Transform options for WebAuthn API
      const transformedOptions = transformOptionsForWebAuthn(options);

      // Step 3: Get assertion from browser
      const assertion = (await navigator.credentials.get({
        publicKey: transformedOptions as PublicKeyCredentialRequestOptions,
      })) as PublicKeyCredential;

      if (!assertion) {
        throw new Error("Failed to authenticate with passkey");
      }

      // Step 4: Complete passkey login
      const result = await completePasskeyLogin({
        email,
        challengeKey,
        assertion,
      });

      return result;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify({ role: data.role }));
      startTokenRefresh();
      toast({
        title: "Success",
        description: "Successfully logged in with passkey!",
      });
      redirectTo();
    },
    onError: (error: any) => {
      // Reset loading state
      setIsPasskeyLogin(false);
      
      // Handle user cancellation
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        // Reset Turnstile to get a new token for password login
        if (turnstile) {
          turnstile.reset();
          setTurnstileToken(null);
        }
        
        toast({
          title: "Authentication Cancelled",
          description: "You can use password login instead.",
          variant: "destructive",
        });
        setShowPasswordField(true);
      } else {
        // Reset Turnstile for other errors too
        if (turnstile) {
          turnstile.reset();
          setTurnstileToken(null);
        }
        
        toast({
          title: "Passkey Login Failed",
          description: error.message || "Failed to authenticate with passkey. You can use password login instead.",
          variant: "destructive",
        });
        setShowPasswordField(true);
      }
    },
  });

  // Password login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!values.password) {
        throw new Error("Password is required");
      }
      const requestBody: Record<string, string> = {
        email: values.email,
        password: values.password,
      };
      if (turnstileToken) {
        requestBody["cf-turnstile-response"] = turnstileToken;
      }
      const response = await axiosInstance.post(apiRoutes.login, requestBody);
      return response.data;
    },
    onSuccess: (data: any, variables) => {
      props.setvarificationToken(data.token);
      props.setEmail(variables.email);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      // Store refreshToken if provided by backend
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
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
    if (hasPasskeys && !showPasswordField && !values.password) {
      // Trigger passkey login
      setIsPasskeyLogin(true);
      passkeyLoginMutation.mutate(values.email);
    } else {
      // Password login - validate password is present
      if (!values.password || values.password.length < 8) {
        form.setError("password", {
          type: "manual",
          message: "Password should be at least 8 characters long",
        });
        return;
      }
      loginMutation.mutate(values as z.infer<typeof formSchema> & { password: string });
    }
  }

  const handlePasskeyLogin = () => {
    const email = form.getValues("email");
    if (!email || !form.formState.isValid) {
      form.trigger("email");
      return;
    }
    setIsPasskeyLogin(true);
    passkeyLoginMutation.mutate(email);
  };

  const handleUsePasswordInstead = () => {
    setShowPasswordField(true);
    form.setFocus("password");
  };

  const handleUsePasskeyInstead = () => {
    setShowPasswordField(false);
    form.setValue("password", "");
  };

  const isLoading = loginMutation.isPending || passkeyLoginMutation.isPending || isPasskeyLogin;

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
            Please sign in to streamline the management and monitoring of penetration tests.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2025 Slash
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* User Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Please enter your information to sign in</p>
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
                          type="text"
                          placeholder="Enter your email..."
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && turnstileToken && !form.formState.errors.email) {
                              e.preventDefault();
                              checkLoginMethodsAsync();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                      {isCheckingLoginMethods && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking login methods...
                        </p>
                      )}
                      {/* Show continue button if email is valid but login method not determined yet */}
                      {!form.formState.errors.email && 
                       emailValue && 
                       emailValue.trim().length > 0 &&
                       turnstileToken && 
                       hasPasskeys === null && 
                       !isCheckingLoginMethods && (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            checkLoginMethodsAsync();
                          }}
                          className="w-full mt-3 bg-primary hover:bg-primary/90 text-white font-medium py-2"
                        >
                          Continue
                        </Button>
                      )}
                    </FormItem>
                  )}
                />

                {/* Conditional Password Field or Passkey Button */}
                {showPasswordField || hasPasskeys === false ? (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Password
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
                          <div className="flex justify-between items-center">
                            <Link
                              to="/forgot-password"
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                            >
                              Forgot Password?
                            </Link>
                            {hasPasskeys === true && (
                              <button
                                type="button"
                                onClick={handleUsePasskeyInstead}
                                className="text-sm text-primary hover:text-primary/80 underline"
                              >
                                Use passkey instead
                              </button>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                ) : hasPasskeys === true && !showPasswordField ? (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={isLoading || !turnstileToken || isCheckingLoginMethods}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Login with Passkey
                        </>
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={handleUsePasswordInstead}
                      className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                    >
                      Use password instead
                    </button>
                  </div>
                ) : null}

                {/* Turnstile Widget */}
                <Turnstile
                  sitekey="0x4AAAAAABAY4zDtElrDH2g0"
                  onVerify={(token) => setTurnstileToken(token)}
                  className="w-full"
                />

                {/* Sign In Button (only shown for password login) */}
                {(showPasswordField || hasPasskeys === false) && (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4" 
                    type="submit"
                    disabled={isLoading || !turnstileToken}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                )}

                {/* Sign Up Link */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account yet?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary/80 hover:underline font-medium">
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
