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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignUpData } from "@/types/types";
import { useMutation } from '@tanstack/react-query';
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Please enter your name.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .min(2)
    .max(50),
  password: z.string().min(8, {
    message: "Password should be at least 8 characters long",
  }).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    }
  ),
});

function SignUpForm(props: {
  setSignUpData: (data: Partial<SignUpData>) => void;
  signUpData: SignUpData;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (userData: SignUpData) => {
      const response = await axiosInstance.post(apiRoutes.signup, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully",
        description: "You can now log in with your credentials",
      });
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: "Failed to create account",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userData = {
      ...props.signUpData,
      name: values.name,
      email: values.email,
      password: values.password,
    };

    mutation.mutate(userData);
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col items-start gap-16 self-stretch min-h-screen">
        <div className="flex flex-col justify-center items-start gap-3 self-stretch">
          <h1 className="font-poppins text-[2.5rem] font-semibold">
            Create a User
          </h1>
          <p className="text-inputBorder text-lg">Please sign up to streamline the management and monitoring of penetration tests.</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-start gap-6 justify-center self-stretch"
          >
            <div className="flex flex-col items-center gap-6 self-stretch">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter your name</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full" 
                        {...field} 
                        disabled={mutation.isPending}
                        placeholder="John Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full" 
                        {...field} 
                        type="email"
                        disabled={mutation.isPending}
                        placeholder="john@example.com"
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
                          className="w-full pr-10"
                          {...field}
                          disabled={mutation.isPending}
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={mutation.isPending}
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
            </div>
            <Button 
              className="w-full text-lg py-4" 
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </Button>
            <div className="text-inputBorder">
              Have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary-900 font-medium hover:underline"
              >
                Sign in Now!
              </Link>
            </div>
          </form>
        </Form>
        <div className="flex gap-3 justify-center w-full">
          <div className="w-2 h-2 rounded-full bg-primary-900" />
          <div className="w-2 h-2 rounded-full bg-primary-900" />
          <div className="w-2 h-2 rounded-full bg-primary-900" />
        </div>
      </div>
      <p className="text-center w-full text-primary-900 font-inter">
        Copyright © 2024 Slash
      </p>
    </div>
  );
}

export default SignUpForm;
