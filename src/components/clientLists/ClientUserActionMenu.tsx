"use client"

import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ClientUserDeleteDialog from "./ClientUserDeleteDialog"
import ClientUserEditDialog from "./ClientUserEditDialog"
import ClientUserReset2FADialog from "./ClientUserReset2FADialog"
import ClientUserDeactivateDialog from "./ClientUserDeactivateDialog"
import type { ClientUser } from "@/types/types"
import { useUser } from "@/hooks/useUser"
interface ClientUserActionMenuProps {
  user: ClientUser
  refetch: () => void
  isClientView?: boolean
}

export default function ClientUserActionMenu({ user, refetch, isClientView = false }: ClientUserActionMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showReset2FADialog, setShowReset2FADialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const {isClient, loading} = useUser()

  if (loading) return null

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isClient() && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setShowEditDialog(true)
                setDropdownOpen(false)
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setShowReset2FADialog(true)
              setDropdownOpen(false)
            }}
          >
            Reset 2FA
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setShowDeactivateDialog(true)
              setDropdownOpen(false)
            }}
            className={`${user.isActive ? "text-destructive focus:text-destructive" : "text-primary-900 focus:text-primary-900"}`}
          >
            {user.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              setShowDeleteDialog(true)
              setDropdownOpen(false)
            }}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ClientUserDeleteDialog
        user={user}
        refetch={refetch}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        isClientView={isClientView}
      />

      <ClientUserEditDialog 
        user={user} 
        refetch={refetch} 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
        isClientView={isClientView}
      />

      <ClientUserReset2FADialog
        user={user}
        refetch={refetch}
        open={showReset2FADialog}
        onOpenChange={setShowReset2FADialog}
      />

      <ClientUserDeactivateDialog
        user={user}
        refetch={refetch}
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      />
    </>
  )
} 