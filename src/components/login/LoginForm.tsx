import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"



const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email"
  }).min(2).max(50),
  password: z.string().min(8, {
    message: 'Password should be atleast 8 characters long'
  }),
  mobile: z.boolean().default(false).optional(),
})
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ''

    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {

    console.log(values)
  }
  
  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-start gap-component justify-center self-stretch">
      <div className="flex flex-col items-center gap-component self-stretch">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input className="w-full" placeholder="Email" {...field} />
              
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem >
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
        aria-label={showPassword ? "Hide password" : "Show password"}
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
          <a href="/login" className="text-primary-900 font-poppins text-sm font-semibold">Forgot Password?</a>
        </div>
        </div>
      <Button className="w-full text-lg py-4" type="submit">Sign in</Button>
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
                <FormLabel>
                Keep me logged in
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
    </form>
  </Form> 
  )
}

export default LoginForm
