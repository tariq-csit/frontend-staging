"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import { FileUpload } from "@/components/FileUpload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSetPageTitle } from "@/hooks/useSetPageTitle"
import { useUser } from "@/hooks/useUser"

// Form schemas
const nameFormSchema = z.object({
  newName: z.string().min(1, { message: "New name is required" }),
})

const emailFormSchema = z.object({
  newEmail: z.string().email({ message: "Valid email is required" }),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, {
      message: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
    }).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message: "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }
    ),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { isPentester } = useUser()

  // Set page title for settings page
  useSetPageTitle("Settings");

  // Individual states for each notification preference
  const [commentNotification, setCommentNotification] = useState(true)
  const [statusChangeNotification, setStatusChangeNotification] = useState(true)
  const [vulnerabilityAlerts, setVulnerabilityAlerts] = useState(true)
  const [loginNotification, setLoginNotification] = useState(true)
  const [reportCommentNotification, setReportCommentNotification] = useState(true)

  const {data: userData} = useQuery({
    queryKey: ['user'],
    queryFn: () => axiosInstance.get(apiRoutes.user).then((res) => res.data),
  })

  // Mutations
  const { mutate: updateName, isPending: isUpdatingName } = useMutation({
    mutationFn: (newName: string) => 
      axiosInstance.put(apiRoutes.user, { ...userData, name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      nameForm.reset()
      toast({
        title: "Success",
        description: "Name updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update name",
        variant: "destructive",
      })
      console.error('Error updating name:', error)
    }
  })

  const { mutate: updateEmail, isPending: isUpdatingEmail } = useMutation({
    mutationFn: (newEmail: string) => 
      axiosInstance.put(apiRoutes.user, { ...userData, email: newEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      emailForm.reset()
      toast({
        title: "Success",
        description: "Email updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update email",
        variant: "destructive",
      })
      console.error('Error updating email:', error)
    }
  })

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      axiosInstance.put(apiRoutes.changePassword, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      passwordForm.reset()
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        passwordForm.setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect'
        })
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update password",
          variant: "destructive",
        })
      }
      console.error('Error updating password:', error)
    }
  })

  const { mutate: updateNotificationPreference, isPending: isUpdatingPreference } = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) => 
      axiosInstance.put(apiRoutes.user, {
        ...userData,
        notificationPreferences: {
          ...userData?.notificationPreferences,
          [key]: value
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast({
        title: "Success",
        description: "Notification preference updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update notification preference",
        variant: "destructive",
      })
      console.error('Error updating notification preferences:', error)
    }
  })

  const { mutate: updateProfilePicture, isPending: isUpdatingProfilePicture } = useMutation({
    mutationFn: async (file: File) => {
      // First upload the profile picture
      const formData = new FormData()
      formData.append('profilePicture', file)
      const response = await axiosInstance.post(apiRoutes.uploadProfilePicture, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Then update the user data with the new profile picture URL
      await axiosInstance.put(apiRoutes.user, {
        ...userData,
        profilePicture: response.data.url
      })
      
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile picture",
        variant: "destructive",
      })
      console.error('Error updating profile picture:', error)
    }
  })

  // Name form
  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      newName: "",
    },
  })

  // Email form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: "",
    },
  })

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Form submission handlers
  const onNameSubmit = (data: z.infer<typeof nameFormSchema>) => {
    updateName(data.newName)
  }

  const onEmailSubmit = (data: z.infer<typeof emailFormSchema>) => {
    updateEmail(data.newEmail)
  }

  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  // Generic handler for all notification preferences
  const onNotificationPreferenceChange = (
    preferenceKey: string,
    checked: boolean,
    setterFunction: (value: boolean) => void
  ) => {
    setterFunction(checked)
    updateNotificationPreference({ key: preferenceKey, value: checked })
  }

  // Initialize all notification preferences from user data
  useEffect(() => {
    if (userData?.notificationPreferences) {
      const prefs = userData.notificationPreferences;
      setCommentNotification(prefs.commentNotification ?? true);
      setStatusChangeNotification(prefs.statusChangeNotification ?? true);
      setVulnerabilityAlerts(prefs.vulnerabilitySubmissionNotification ?? true);
      setLoginNotification(prefs.loginNotification ?? true);
      setReportCommentNotification(prefs.reportCommentNotification ?? true);
    }
  }, [userData]);

  return (
    <div className="mx-4 py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Settings</h1>

      {/* User Management Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">User Management</h2>
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {/* Change Name */}
              <AccordionItem value="name" className="border-b dark:border-gray-700">
                <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-gray-200">
                  <span className="text-base font-medium">Change Name</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Form {...nameForm}>
                    <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4 max-w-md">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Name</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{userData?.name}</p>
                      </div>
                      <FormField
                        control={nameForm.control}
                        name="newName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">Enter New Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" disabled={isUpdatingName} />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        disabled={isUpdatingName}
                      >
                        {isUpdatingName ? "Updating..." : "Update"}
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>

              {/* Change Email */}
              <AccordionItem value="email" className="border-b dark:border-gray-700">
                <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-gray-200">
                  <span className="text-base font-medium">Change Email</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 max-w-md">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Email</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{userData?.email}</p>
                      </div>
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">Enter New Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" disabled={isUpdatingEmail} />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        disabled={isUpdatingEmail}
                      >
                        {isUpdatingEmail ? "Updating..." : "Update"}
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>

              {/* Change Password */}
              <AccordionItem value="password" className="border-b dark:border-gray-700">
                <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-gray-200">
                  <span className="text-base font-medium">Change Password</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">Enter Current Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" disabled={isUpdatingPassword} />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">Enter New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" disabled={isUpdatingPassword} />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">Re-enter New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" disabled={isUpdatingPassword} />
                            </FormControl>
                            <FormMessage className="dark:text-red-400" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={isUpdatingPassword}
                        className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white"
                      >
                        {isUpdatingPassword ? "Updating..." : "Update"}
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>

              {/* Change Profile Picture */}
              <AccordionItem value="profile-picture" className="border-b-0">
                <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-gray-200">
                  <span className="text-base font-medium">Change Profile Picture</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 max-w-md">
                    {userData?.profilePicture && (
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Picture</p>
                        <Avatar className="h-16 w-16 dark:border dark:border-gray-600">
                          <AvatarImage src={userData.profilePicture} alt="Profile" />
                          <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <FileUpload
                      value={[]}
                      onChange={(files) => {
                        if (files.length > 0) {
                          updateProfilePicture(files[0])
                        }
                      }}
                      maxSize={5 * 1024 * 1024} // 5MB
                      acceptedTypes={{
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png'],
                      }}
                      disabled={isUpdatingProfilePicture}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Notification Preferences</h2>
        <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <CardContent className="pb-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium dark:text-gray-200">Comment notifications</span>
                <Switch
                  checked={commentNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('commentNotification', checked, setCommentNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                  disabled={isUpdatingPreference}
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t dark:border-gray-700">
                <span className="text-base font-medium dark:text-gray-200">Status change notifications</span>
                <Switch
                  checked={statusChangeNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('statusChangeNotification', checked, setStatusChangeNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                  disabled={isUpdatingPreference}
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t dark:border-gray-700">
                <span className="text-base font-medium dark:text-gray-200">Vulnerability alerts</span>
                <Switch
                  checked={vulnerabilityAlerts}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('vulnerabilitySubmissionNotification', checked, setVulnerabilityAlerts)
                  }
                  className="data-[state=checked]:bg-primary"
                  disabled={isUpdatingPreference}
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t dark:border-gray-700">
                <span className="text-base font-medium dark:text-gray-200">Login notifications</span>
                <Switch
                  checked={loginNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('loginNotification', checked, setLoginNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                  disabled={isUpdatingPreference}
                />
              </div>
              {!isPentester() && (
                <div className="flex items-center justify-between py-4 border-t dark:border-gray-700">
                  <span className="text-base font-medium dark:text-gray-200">Report comment notifications</span>
                  <Switch
                    checked={reportCommentNotification}
                    onCheckedChange={(checked) => 
                      onNotificationPreferenceChange('reportCommentNotification', checked, setReportCommentNotification)
                    }
                    className="data-[state=checked]:bg-primary"
                    disabled={isUpdatingPreference}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

