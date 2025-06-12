import fileIcon from "/file.svg";
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
import { SignUpData } from "@/types/types";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Please enter your company's name.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email",
    })
    .min(2)
    .max(50),
  logoUrl: z.string().optional(),
});

interface UploadResponse {
  url: string;
}

function Credentials(props: {
  setSignUpData: (data: Partial<SignUpData>) => void;
  signUpData: SignUpData;
}) {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      logoUrl: undefined,
    },
  });

  // Logo upload mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const response = await axiosInstance.post(apiRoutes.uploadLogo, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      form.setValue("logoUrl", data.url);
      toast({
        title: "Logo uploaded successfully",
      });
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
      toast({
        title: "Failed to upload logo",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  // Form submission mutation
  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      props.setSignUpData({
        ...props.signUpData,
        companyName: values.companyName,
        poc_email: values.email,
        logoUrl: values.logoUrl || "",
      });
    },
    onSuccess: () => {
      toast({
        title: "Company details saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving company details:', error);
      toast({
        title: "Failed to save company details",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    submitMutation.mutate(values);
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
            Set up your company profile for penetration testing management.
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2024 Slash
        </div>
      </div>

      {/* Right side - Company Details Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Building Icon */}
            <div className="flex justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Building2 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Company Details</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Set up your company profile</p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Name Field */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Company Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600"
                          placeholder="Enter your company name"
                          disabled={submitMutation.isPending || uploadLogoMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Point of Contact Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-gray-600"
                          placeholder="contact@company.com"
                          disabled={submitMutation.isPending || uploadLogoMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Logo Upload Field */}
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Company Logo (optional)
                      </FormLabel>
                      <FormControl>
                        <FileUpload
                          value={uploadedFile ? [uploadedFile] : []}
                          onChange={async (files) => {
                            if (files.length > 0) {
                              setUploadedFile(files[0]);
                              uploadLogoMutation.mutate(files[0]);
                            } else {
                              setUploadedFile(null);
                              field.onChange("");
                            }
                          }}
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          acceptedTypes={{
                            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg']
                          }}
                          className="w-full"
                          disabled={submitMutation.isPending || uploadLogoMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4"
                  disabled={submitMutation.isPending || uploadLogoMutation.isPending}
                >
                  {submitMutation.isPending || uploadLogoMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </Form>

            {/* Progress dots */}
            <div className="flex gap-3 justify-center w-full">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Credentials;
