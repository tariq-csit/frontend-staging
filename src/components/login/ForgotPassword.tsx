import { apiRoutes } from "@/lib/routes";
import { Loader2 } from "lucide-react";
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
    <div className="flex flex-col gap-16 h-screen justify-center">
      <div className="flex px-10 flex-col items-center justify-center gap-8 self-center font-poppins">
        <div className="flex flex-col items-center gap-8 self-stretch max-w-md">
          <div className="flex flex-col justify-center items-start gap-3 self-stretch">
            <h1 className="font-poppins text-[2.5rem] font-semibold dark:text-gray-100">
              Forgot Password?
            </h1>
            <p className="self-stretch text-inputBorder dark:text-gray-400 font-poppins text-lg">
              Enter your email address and we'll send you a link to reset your password.
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
                      <FormLabel className="dark:text-gray-200">Enter your Email</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <Turnstile
                sitekey="0x4AAAAAABAY4zDtElrDH2g0"
                onVerify={(token) => setTurnstileToken(token)}
                className="w-full"
              />
              <Button 
                className="w-full text-lg py-4 dark:bg-indigo-600 dark:hover:bg-indigo-700" 
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
            </form>
          </Form>
          <p className="font-poppins text-inputBorder dark:text-gray-400">
            Remember your password?
            <Link to={'/'} className="text-primary-900 dark:text-indigo-400 font-medium cursor-pointer">
              {" "}
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <p className="text-center w-full text-primary-900 dark:text-indigo-400 font-inter">
        Copyright © {new Date().getFullYear()} Slash
      </p>
    </div>
  );
}

export default ForgotPassword;
