import { apiRoutes } from "@/lib/routes";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { isAxiosError } from "axios";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .min(2)
    .max(50),
  password: z.string().min(8, {
    message: "Password should be atleast 8 characters long",
  }),
  mobile: z.boolean().default(false).optional(),
});



function InitialForm(props:{
  settempToken: Function,
  setvarificationToken: (token: string)=>void,
  setEmail : (email: string)=>void
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axiosInstance.post(apiRoutes.login, {
        email: values.email,
        password: values.password,
      });
      props.setvarificationToken(response.data.token);
      props.setEmail(values.email);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      setError(false);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "2FA setup required") {
          props.settempToken(error.response.data.tempToken);
          setError(false);
        } else {
          console.log(errorMessage);
          setError(true);
        }
      } else {
        console.log(error);
      }
    }
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
                        {error && <span className="text-red-600 pt-12">Invalid username and password</span>}
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end self-stretch">
                    <a
                      href="/login"
                      className="text-primary-900 font-poppins text-sm font-semibold"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <div className="cf-turnstile" data-sitekey="0x4AAAAAABAY4zDtElrDH2g0"></div>
                <Button className="w-full text-lg py-4" type="submit">
                  Sign in
                </Button>
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          className="h-[1.125rem] w-[1.125rem] my-auto"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="pb-2 text-inputBorder font-poppins text-sm font-normal">
                        <FormLabel>Keep me logged in</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <p className="font-poppins text-inputBorder ">
              Don’t have an account?
              <Link to={'/signup'} className="text-primary-900 font-medium cursor-pointer">
                {" "}
                Signup Now!
              </Link>
            </p>
            <div className="flex flex-col items-start gap-[0.5625rem] self-stretch">
              <div className="flex justify-center items-center gap-3 self-stretch text-inputBorder">
                <div className="w-[4.375rem] border h-[0.0625rem] bg-inputBorder" />
                <span className="w-[1.0625rem] h-[1.1875rem] -mt-2">or</span>
                <div className="w-[4.375rem] border h-[0.0625rem] bg-inputBorder" />
              </div>
              <div className="flex justify-center items-center gap-2 self-stretch">
                <img src="/google.svg" />
                <span className="w-[9.9375rem] text-inputBorder font-poppins">
                  Sign in with Google
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center w-full text-primary-900 font-inter">
            Copyright © 2024 Slash
      </p>
      </div>
  )
}

export default InitialForm
