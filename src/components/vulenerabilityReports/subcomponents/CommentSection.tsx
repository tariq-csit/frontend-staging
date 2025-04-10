"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Paperclip } from "lucide-react"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import { useMutation } from "@tanstack/react-query"
export default function CommentBox({ pentestId, vulnerabilityId }: { pentestId: string, vulnerabilityId: string }) {
  const [isInternal, setIsInternal] = useState(false)
  const [comment, setComment] = useState("")
  const { mutate: addComment } = useMutation({
    mutationFn: (data: { comment: string, isInternal: boolean }) => axiosInstance.post(apiRoutes.pentests.vulnerabilities.comment(pentestId, vulnerabilityId), data),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addComment({ comment, isInternal })
    setComment("")
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-md bg-background text-foreground border border-border">
          <Textarea
            placeholder="Add Comment..."
            className="min-h-[30px] border-none bg-transparent text-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0" value={comment} onChange={(e) => setComment(e.target.value)} /> <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-white" aria-label="Attach file" >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="internal-comment"
              checked={isInternal}
              onCheckedChange={setIsInternal}
              className="data-[state=checked]:bg-indigo-600"
            />
            <Label htmlFor="internal-comment" className="text-sm text-gray-500">
              Make internal comment
            </Label>
          </div>

          <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white">
            Add Comment
          </Button>
        </div>

        {isInternal && (
          <p className="text-xs text-gray-500">Internal comments will only be shown to your team members</p>
        )}
      </form>
    </div>
  )
}
