"use client"

import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ClientDeleteDialog from "./ClientDeleteDialog"
import ClientEditDialog from "./ClientEditDialog"
import type { Client } from "@/types/types"

interface ClientActionMenuProps {
  client: Client
  refetch: () => void
}

export default function ClientActionMenu({ client, refetch }: ClientActionMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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
              setShowDeleteDialog(true)
              setDropdownOpen(false)
            }}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ClientDeleteDialog
        client={client}
        refetch={refetch}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />

      <ClientEditDialog client={client} refetch={refetch} open={showEditDialog} onOpenChange={setShowEditDialog} />
    </>
  )
}
