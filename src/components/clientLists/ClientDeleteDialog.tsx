"use client"

import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { Client } from "@/types/types"
import { toast } from "@/hooks/use-toast"
import type { Dispatch, SetStateAction } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ClientDeleteDialogProps {
  client: Client
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export default function ClientDeleteDialog({ client, refetch, open, onOpenChange }: ClientDeleteDialogProps) {
  const { mutate: deleteClient } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(apiRoutes.clients.detail(client._id))
    },
    onSuccess: () => {
      onOpenChange(false)
      refetch()

      setTimeout(() => {
        toast({
          title: "Client deleted successfully",
          description: "The client has been deleted successfully",
        })
      }, 100)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {client.name}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteClient()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
