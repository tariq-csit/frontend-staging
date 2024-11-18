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
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
const loginApiUrl = "http://172.86.114.162:4000/api/auth/login";
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
  setvarificationToken: Function
}) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post(loginApiUrl, {
        email: values.email,
        password: values.password,
      });
      props.setvarificationToken(response.data.token);
      console.log(response)
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.message === "2FA setup required") {
          props.settempToken(error.response.data.tempToken);
        } else {
          console.log(error.response.data.message);
        }
      } else {
        console.log(error);
      }
    }
  }
  return (
    <div>
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
                        <FormControl>
                          <Input
                            className="w-full"
                            placeholder="Email"
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
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              className="pr-10"
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
                    <a
                      href="/login"
                      className="text-primary-900 font-poppins text-sm font-semibold"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
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
              <a className="text-primary-900 font-medium cursor-pointer">
                {" "}
                Signup Now!
              </a>
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
      </div>
  )
}

export default InitialForm
