import { apiRoutes } from "@/lib/routes";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
      localStorage.setItem("refreshToken", data.refreshToken);
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
    <div className="flex flex-col gap-16">
      <div className="flex px-10 flex-col items-start justify-center gap-8 flex-component self-start font-poppins">
        <div className="flex flex-col items-start gap-8 self-stretch">
          <div className="flex flex-col justify-center items-start gap-3 self-stretch">
            <h1 className="font-poppins text-[2.5rem] font-semibold">
              Welcome Back!
            </h1>
            <p className="self-stretch text-inputBorder font-poppins text-lg">
              Please sign in to streamline the management and monitoring of
              penetration tests.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-start gap-6 justify-center self-stretch"
            >
              <div className="flex flex-col items-center gap-6 self-stretch">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter your Email</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter your Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10 w-full"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end self-stretch">
                  <Link
                    to="/forgot-password"
                    className="text-primary-900 font-poppins text-sm font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <Turnstile
                sitekey="0x4AAAAAABAY4zDtElrDH2g0"
                onVerify={(token) => setTurnstileToken(token)}
                className="w-full"
              />
              <Button 
                className="w-full text-lg py-4" 
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
            </form>
          </Form>
          <p className="font-poppins text-inputBorder ">
            Don't have an account?
            <Link to={'/signup'} className="text-primary-900 font-medium cursor-pointer">
              {" "}
              Signup Now!
            </Link>
          </p>
        </div>
      </div>
      <p className="text-center w-full text-primary-900 font-inter">
        Copyright © 2024 Slash
      </p>
    </div>
  );
}

export default InitialForm;
