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
import { useEffect } from "react";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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
  console.log(resetToken);

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
    <div className="flex flex-col h-screen justify-center max-w-md mx-auto gap-4">
      <h1 className="font-poppins text-[2rem] font-semibold">Reset Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-start gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-indigo-700 hover:bg-indigo-800"
            disabled={isPending}
          >
            {isPending ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ResetPassword; 