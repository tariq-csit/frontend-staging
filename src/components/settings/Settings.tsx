"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"

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
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function SettingsPage() {
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
  console.log(userData)

  const queryClient = useQueryClient()


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
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Form submission handlers
  const onNameSubmit = async (data: z.infer<typeof nameFormSchema>) => {
    try {
      await axiosInstance.put(apiRoutes.user, {
        ...userData,
        name: data.newName
      });

      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      nameForm.reset();
    } catch (error) {
      console.error('Error updating name:', error);
      nameForm.setError('root', {
        type: 'manual',
        message: 'Failed to update name'
      });
    }
  }

  const onEmailSubmit = async (data: z.infer<typeof emailFormSchema>) => {
    try {
      await axiosInstance.put(apiRoutes.user, {
        ...userData,
        email: data.newEmail
      });

      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      emailForm.reset();
    } catch (error) {
      console.error('Error updating email:', error);
      emailForm.setError('root', {
        type: 'manual',
        message: 'Failed to update email'
      });
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    try {
      await axiosInstance.put(apiRoutes.changePassword, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      // Check if error is due to incorrect current password
      if (error.response?.status === 401) {
        passwordForm.setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect'
        });
      } else {
        passwordForm.setError('root', {
          type: 'manual',
          message: 'Failed to update password'
        });
      }
    }
  }

  // Generic handler for all notification preferences
  const onNotificationPreferenceChange = async (
    preferenceKey: string,
    checked: boolean,
    setterFunction: (value: boolean) => void
  ) => {
    try {
      await axiosInstance.put(apiRoutes.user, {
        ...userData,
        notificationPreferences: {
          ...userData?.notificationPreferences,
          [preferenceKey]: checked
        }
      });

      setterFunction(checked);
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert the switch if update fails
      setterFunction(!checked);
    }
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
    <div className="mx-4 py-8 px-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* User Management Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {/* Change Name */}
              <AccordionItem value="name" className="border-b">
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <span className="text-base font-medium">Change Name</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Form {...nameForm}>
                    <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4 max-w-md">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Current Name</p>
                        <p className="text-sm text-gray-900">{userData?.name}</p>
                      </div>
                      <FormField
                        control={nameForm.control}
                        name="newName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter New Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800">
                        Update
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>

              {/* Change Email */}
              <AccordionItem value="email" className="border-b">
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <span className="text-base font-medium">Change Email</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 max-w-md">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">Current Email</p>
                        <p className="text-sm text-gray-900">{userData?.email}</p>
                      </div>
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter New Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800">
                        Update
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>

              {/* Change Password */}
              <AccordionItem value="password" className="border-b-0">
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
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
                            <FormLabel>Enter Current Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Re-enter New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800">
                        Update
                      </Button>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
        <Card className="shadow-sm">
          <CardContent className="pb-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-medium">Comment notifications</span>
                <Switch
                  checked={commentNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('commentNotification', checked, setCommentNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t">
                <span className="text-base font-medium">Status change notifications</span>
                <Switch
                  checked={statusChangeNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('statusChangeNotification', checked, setStatusChangeNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t">
                <span className="text-base font-medium">Vulnerability alerts</span>
                <Switch
                  checked={vulnerabilityAlerts}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('vulnerabilitySubmissionNotification', checked, setVulnerabilityAlerts)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t">
                <span className="text-base font-medium">Login notifications</span>
                <Switch
                  checked={loginNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('loginNotification', checked, setLoginNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between py-4 border-t">
                <span className="text-base font-medium">Report comment notifications</span>
                <Switch
                  checked={reportCommentNotification}
                  onCheckedChange={(checked) => 
                    onNotificationPreferenceChange('reportCommentNotification', checked, setReportCommentNotification)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

