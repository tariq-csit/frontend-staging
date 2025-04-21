"use client"

import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { ClientUser } from "@/types/types"
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
import { Loader2 } from "lucide-react"

interface ClientUserDeleteDialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export default function ClientUserDeleteDialog({ user, refetch, open, onOpenChange }: ClientUserDeleteDialogProps) {
  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(apiRoutes.clientUsers.detail(user._id))
    },
    onSuccess: () => {
      onOpenChange(false)
      refetch()

      setTimeout(() => {
        toast({
          title: "Client user deleted successfully",
          description: "The client user has been deleted successfully",
        })
      }, 100)
    },
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {user.name}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteUser()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 