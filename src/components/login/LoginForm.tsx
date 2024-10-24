import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const loginApiUrl = "http://172.86.114.162:4000/api/auth/login";
const twoFaApiUrl = "http://172.86.114.162:4000/api/auth/setup-2fa";
const twoFaVerifyUrl = "http://172.86.114.162:4000/api/auth/setup-2fa-verify";

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
const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [tempToken, settempToken] = useState("");
  const [qrCode, setqrCode] = useState("");
  const [token, settoken] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post(loginApiUrl, {
        email: values.email,
        password: values.password,
      });
      console.log(response);
    } catch (error: any) {
      error.response.data.message === "2FA setup required"
        ? settempToken(error.response.data.tempToken)
        : console.log(error);
    }
  }
  async function pinSubmit(data: z.infer<typeof pinSchema>) {
    try {
      const response = await axios.post(
        twoFaVerifyUrl,
        {
          token: data.pin,
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`, // Add the token to the headers
          },
        }
      );
      settoken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error: any) {
      console.log(error);
    }
  }

  if (tempToken === "" && qrCode === "") {
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
                className="flex flex-col items-start gap-component justify-center self-stretch"
              >
                <div className="flex flex-col items-center gap-component self-stretch">
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
    );
  } else if (tempToken !== "" && qrCode === "") {
    return (
      <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
        <h2 className="text-xl font-semibold">
          2 Factor Authentication Setup Required
        </h2>
        <Button
          className="px-8 shadow-component"
          onClick={async () => {
            try {
              const response = await axios.post(
                twoFaApiUrl,
                {}, // If the body is empty, pass an empty object
                {
                  headers: {
                    Authorization: `Bearer ${tempToken}`, // Add the token to the headers
                  },
                }
              );

              setqrCode(response.data.qrCodeUrl);
              console.log(response.data.qrCodeUrl);
            } catch (error) {
              console.error("Error setting up 2FA:", error);
            }
          }}
        >
          Next
        </Button>
      </div>
    );
  } else if (token === "" && qrCode !== "") {
    return (
      <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
        <h2 className="text-xl font-semibold">
          Scan this QR code to set up 2FA:
        </h2>
        <img
          src={qrCode}
          alt="QR code"
          style={{ width: "256px", height: "256px", objectFit: "contain" }}
        />
        <Form {...pinForm}>
          <form
            onSubmit={pinForm.handleSubmit(pinSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={pinForm.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    );
  } else {
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
      <h2 className="text-xl font-semibold">
        2 Factor Authentication Successful
      </h2>
      <Link to={"/login"} className="px-8 shadow-component">
        Login
      </Link>
    </div>;
  }
}

export default LoginForm;
