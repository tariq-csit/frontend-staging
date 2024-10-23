import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

import axios from 'axios';


const api = '172.86.114.162:4000'
const loginApiUrl = 'http://172.86.114.162:4000/api/auth/login';
const twoFaApiUrl = 'http://172.86.114.162:4000/api/auth/setup-2fa'



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
  const [tempToken, settempToken] = useState('')
  const [qrCode, setqrCode] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ''

    },
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post(loginApiUrl, {
        "email": values.email,
        "password": values.password
      });
      console.log(response);
    } catch (error:any) {
      settempToken(error.response.data.tempToken)
    }
  }

  if(tempToken === '' && qrCode===''){
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
  )}
  else if(tempToken !== '' && qrCode===''){
    return (
      <div className="p-8 flex flex-col justify-center items-center">
        <h2>2 factor authentication required</h2>
        <Button onClick={
         async ()=>{
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
            console.log(response.data.qrCodeUrl)
          } catch (error) {
            console.error('Error setting up 2FA:', error);
          }
        }}>Next</Button>
      </div>
    )
}else{
  return(<div className="">
    qr code here
  </div>)
}
}

export default LoginForm

