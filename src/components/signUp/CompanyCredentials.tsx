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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

function Credentials(props: {
  setSignUpData: (data: Partial<SignUpData>) => void;
  signUpData: SignUpData;
}) {
  const { toast } = useToast();
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
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col items-start gap-8 self-stretch min-h-screen">
        <div className="flex flex-col justify-center items-start font-inter self-stretch">
          <p>Step 2/3</p>
          <h1 className="font-poppins text-[2.5rem] font-semibold">
            Company Details
          </h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-start gap-6 justify-center self-stretch"
          >
            <div className="flex flex-col items-center gap-6 self-stretch">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter your company name</FormLabel>
                    <FormControl>
                      <Input className="w-full" {...field} />
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
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload your Logo (optional)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center gap-2 rounded-formInput border border-dashed bg-[#F5F5F5] border-inputBorder p-2.5 self-stretch">
                        <div className="flex flex-col items-center gap-2 self-stretch p-4 sm:p-12">
                          <div className="flex w-4/5 sm:w-auto px-4 justify-center items-center sm:gap-8 border rounded-formInput border-[#353086]">
                            <img src={fileIcon} alt="File icon" />
                            <Input
                              type="file"
                              accept="image/*"
                              placeholder="Upload your logo"
                              className="border-none"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  uploadLogoMutation.mutate(e.target.files[0]);
                                }
                              }}
                              disabled={uploadLogoMutation.isPending}
                            />
                          </div>
                          {uploadLogoMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            <label className="font-poppins text-inputBorder text-base lowercase font-medium">
                              or drop logo here
                            </label>
                          )}
                          {field.value && (
                            <p className="text-sm text-green-600">Logo uploaded successfully</p>
                          )}
                        </div>
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
              disabled={submitMutation.isPending || uploadLogoMutation.isPending}
            >
              {submitMutation.isPending ? (
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
        <div className="flex gap-3 justify-center w-full">
          <div className="w-2 h-2 rounded-full bg-primary-900" />
          <div className="w-2 h-2 rounded-full bg-primary-900" />
          <div className="w-2 h-2 rounded-full bg-[#C8C8C8]" />
        </div>
      </div>
      <p className="text-center w-full text-primary-900 font-inter">
        Copyright © 2024 Slash
      </p>
    </div>
  );
}

export default Credentials;
