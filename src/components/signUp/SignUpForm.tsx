import { Eye, EyeOff } from "lucide-react";
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
    message: "Password should be atleast 8 characters long",
  }),
});

function SignUpForm(props:{
  setSignUpData: (data:string)=>void
}) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    props.setSignUpData(values.toString());
    navigate('/login')
  }
  return (
    <div className="flex flex-col gap-16">
    <div className="flex flex-col items-start gap-16 self-stretch min-h-screen">
      <div className="flex flex-col justify-center items-start gap-3 self-stretch">
        <h1 className="font-poppins text-[2.5rem] font-semibold">
        Welcome Back!
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
                  <FormLabel>Enter your company name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Point of Contact Email</FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} />
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
          </div>
          <Button className="w-full text-lg py-4" type="submit">
            Sign up
          </Button>
          <div className="text-inputBorder">
            Have an account?<Link to={'/login'} className="text-primary-900 font-medium"> Signin Now!</Link>
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
