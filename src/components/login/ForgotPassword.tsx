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

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .min(2)
    .max(50),
});

function ForgotPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.body.appendChild(script);

    const interval = setInterval(() => {
      const token = (window as any).turnstile?.getResponse();
      if (token) {
        setTurnstileToken(token);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const {mutate: forgotPassword, isPending} = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await axiosInstance.post(apiRoutes.forgotPassword, {
        email: values.email,
        "cf-turnstile-response": turnstileToken,
      });
    },
    onSuccess: () => {
      toast({
        title: "Reset link sent to email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending reset link",
        description: error.response.data.message,
      });
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      forgotPassword(values);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        console.error(error.response.data.message);
      } else {
        console.error(error);
      }
    }
  }

  return (
    <div className="flex flex-col h-screen justify-center max-w-md mx-auto gap-4">
      <h1 className="font-poppins text-[2rem] font-semibold">Forgot Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-start gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="cf-turnstile" data-sitekey="0x4AAAAAABAY4zDtElrDH2g0"></div>
          <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ForgotPassword;
