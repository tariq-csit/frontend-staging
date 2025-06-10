import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignUpData } from "@/types/types";
import { Key } from "lucide-react";

const formSchema = z.object({
  signUpCode: z.string().min(2, {
    message: "Sign Up code must be atleast 9 charaters long.",
  }),
});

const Code = (props: {
  setSignUpData: (data: Partial<SignUpData>) => void,
  signUpData: SignUpData,
}) => {

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        signUpCode: "",
      },
    });

  const pinSubmit = (data: z.infer<typeof formSchema>) => {
    props.setSignUpData({
      ...props.signUpData,
      code: data.signUpCode,
    });
  }

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
            Join the next generation of penetration testing management.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - Signup Code Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Key Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Key className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Enter your signup code</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Please enter the signup code provided to you</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(pinSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="signUpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600" 
                          placeholder="eg: 5fc5277cb2c5983918c25c92c31b018413ce4b4" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4"
                >
                  Continue
                </Button>
              </form>
            </Form>

            {/* Progress dots */}
            <div className="flex gap-3 justify-center w-full">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Code;
