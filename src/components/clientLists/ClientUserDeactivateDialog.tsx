"use client"

import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { ClientUser } from "@/types/types"
import { toast } from "@/hooks/use-toast"
import type { Dispatch, SetStateAction } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClientUserDeactivateDialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export default function ClientUserDeactivateDialog({ user, refetch, open, onOpenChange }: ClientUserDeactivateDialogProps) {
  const { mutate: deactivateUser, isPending } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(apiRoutes.clientUsers.deactivate(user._id))
    },
    onSuccess: () => {
      refetch()
      toast({
        title: "User Deactivated",
        description: `${user.name} has been deactivated successfully.`,
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate {user.name}? They will no longer be able to access the system.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => deactivateUser()}
            variant="destructive"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 