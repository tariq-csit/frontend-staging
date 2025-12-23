"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { PasskeyManagementSection } from "./PasskeyManagementSection"
import { User, Lock, Bell, Shield } from "lucide-react"

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

type Tab = 'account' | 'security' | 'notifications'

export default function SettingsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { isPentester } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>('account')

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
    }
  })

  const { mutate: updateProfilePicture, isPending: isUpdatingProfilePicture } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('profilePicture', file)
      const response = await axiosInstance.post(apiRoutes.uploadProfilePicture, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
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
    }
  })

  // Forms
  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      newName: "",
    },
  })

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: "",
    },
  })

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

  const onNotificationPreferenceChange = (
    preferenceKey: string,
    checked: boolean,
    setterFunction: (value: boolean) => void
  ) => {
    setterFunction(checked)
    updateNotificationPreference({ key: preferenceKey, value: checked })
  }

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

  const tabs = [
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-3 text-sm font-medium transition-all relative border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Picture & Name Card - Combined */}
              <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-gray-100">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture Section - Compact */}
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24 dark:border-2 dark:border-gray-600">
                        <AvatarImage src={userData?.profilePicture} alt="Profile" />
                        <AvatarFallback className="text-lg">{userData?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">JPG or PNG. Max size 5MB</p>
                        <div className="flex gap-2">
                          <label htmlFor="profile-upload" className="cursor-pointer">
                            <div className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors inline-block">
                              {isUpdatingProfilePicture ? "Uploading..." : "Change Picture"}
                            </div>
                            <input
                              id="profile-upload"
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => {
                                const files = e.target.files
                                if (files && files.length > 0) {
                                  const file = files[0]
                                  if (file.size <= 5 * 1024 * 1024) {
                                    updateProfilePicture(file)
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "File size must be less than 5MB",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              }}
                              disabled={isUpdatingProfilePicture}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t dark:border-gray-700"></div>

                  {/* Display Name Section */}
                  <div>
                    <Form {...nameForm}>
                      <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Email Card */}
              <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-gray-100">Email Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Password Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your password to keep your account secure
                  </p>
                </div>
                <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                          className="bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        >
                          {isUpdatingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
              </div>

              {/* Passkeys Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Passkeys
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Secure, passwordless authentication for faster and safer login
                  </p>
                </div>
                <PasskeyManagementSection />
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
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
          )}
        </div>
      </div>
    </div>
  )
}
