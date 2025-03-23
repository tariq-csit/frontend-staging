"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

// Form schemas
const nameFormSchema = z.object({
  currentName: z.string().min(1, { message: "Current name is required" }),
  newName: z.string().min(1, { message: "New name is required" }),
})

const emailFormSchema = z.object({
  currentEmail: z.string().email({ message: "Valid email is required" }),
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
  const [vulnerabilityAlerts, setVulnerabilityAlerts] = useState(true)

  // Name form
  const nameForm = useForm<z.infer<typeof nameFormSchema>>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      currentName: "",
      newName: "",
    },
  })

  // Email form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      currentEmail: "",
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
  const onNameSubmit = (data: z.infer<typeof nameFormSchema>) => {
    console.log("Name update:", data)
    // Handle name update logic here
    nameForm.reset()
  }

  const onEmailSubmit = (data: z.infer<typeof emailFormSchema>) => {
    console.log("Email update:", data)
    // Handle email update logic here
    emailForm.reset()
  }

  const onPasswordSubmit = (data: z.infer<typeof passwordFormSchema>) => {
    console.log("Password update:", data)
    // Handle password update logic here
    passwordForm.reset()
  }

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
                      <FormField
                        control={nameForm.control}
                        name="currentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter Current Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      <FormField
                        control={emailForm.control}
                        name="currentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enter Current Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="w-full" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
            <div className="flex items-center justify-between py-4">
              <span className="text-base font-medium">Vulnerability alerts</span>
              <Switch
                checked={vulnerabilityAlerts}
                onCheckedChange={setVulnerabilityAlerts}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

