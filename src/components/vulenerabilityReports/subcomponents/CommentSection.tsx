"use client"

import type React from "react"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Paperclip, Trash, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/useUser"

interface File {
  name: string
  url: string
}

async function uploadFiles(files: FileList): Promise<File[]> {
  const uploadedFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append('attachment', files[i]);
    
    const response = await axiosInstance.post(apiRoutes.uploadVulnerabilityAttachment, formData);
    const data = response.data;
    
    uploadedFiles.push({
      name: data.name,
      url: data.url
    });
  }
  
  return uploadedFiles;
}

export default function CommentBox({ 
  pentestId, 
  vulnerabilityId, 
  refetch, 
  isClient = false 
}: { 
  pentestId: string, 
  vulnerabilityId: string, 
  refetch: () => void,
  isClient?: boolean 
}) {
  const [isInternal, setIsInternal] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { isPentester } = useUser()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { mutate: addComment, isPending: isSubmitting } = useMutation({
    mutationFn: (data: { comment: string, internal: boolean, attachments: File[] }) => {
      if (isClient) {
        return axiosInstance.post(apiRoutes.client.pentests.vulnerabilities.comment(pentestId, vulnerabilityId), data);
      } else if (isPentester()) {
        return axiosInstance.post(apiRoutes.pentester.vulnerabilities.comment(pentestId, vulnerabilityId), data);
      } else {
        return axiosInstance.post(apiRoutes.pentests.vulnerabilities.comment(pentestId, vulnerabilityId), data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
        variant: "default",
      })
      setComment("")
      setIsInternal(false)
      setFiles([])
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
      console.error("Error adding comment:", error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim() && !isSubmitting && !isUploading) {
      addComment({ comment, internal: isInternal, attachments: files })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Enter or Cmd+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (comment.trim() && !isSubmitting && !isUploading) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-md text-foreground border border-gray-200 dark:border-gray-700">
          <div className="mt-2">
            {files.length > 0 && (
              <div className="flex flex-nowrap px-4 py-2 space-x-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 w-fit p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                    <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-100 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-100 break-words whitespace-pre-wrap max-w-[200px]">{file.name}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      disabled={isSubmitting}
                    >
                      <Trash className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="Add Comment... (Ctrl+Enter to submit)"
            className="min-h-[30px] p-4 border-none bg-transparent text-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0" 
            value={comment} 
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          /> 
          <input
            type="file"
            multiple
            className="absolute right-4 top-4 text-gray-400 dark:text-gray-100 hover:text-primary-900 transition-all duration-300"
            aria-label="Attach files"
            onChange={async (e) => {
              const fileList = e.target.files;
              if (fileList) {
                setIsUploading(true)
                try {
                  const uploadedFiles = await uploadFiles(fileList);
                  setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
                  toast({
                    title: "Success",
                    description: "Files uploaded successfully",
                    variant: "default",
                  })
                } catch (error) {
                  console.error('Error uploading files:', error);
                  toast({
                    title: "Error",
                    description: "Failed to upload files. Please try again.",
                    variant: "destructive",
                  })
                } finally {
                  setIsUploading(false)
                }
              }
            }}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={isSubmitting || isUploading}
          />
          <label 
            htmlFor="file-upload" 
            className={`absolute right-3 top-3 cursor-pointer group ${(isSubmitting || isUploading) ? 'pointer-events-none opacity-50' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5 group-hover:text-primary dark:text-gray-100 transition-all duration-300" />
            )}
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="internal-comment"
              checked={isInternal}
              onCheckedChange={setIsInternal}
              className="data-[state=checked]:bg-indigo-600"
              disabled={isSubmitting}
            />
            <Label htmlFor="internal-comment" className="text-sm text-gray-500 dark:text-gray-100">
              Make internal comment
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline-flex items-center">
              <span className="mr-1">Press</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-md">Ctrl</kbd>
              <span className="mx-1">+</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-md">Enter</kbd>
            </span>
            <Button 
              type="submit" 
              className="bg-indigo-700 hover:bg-indigo-800 text-white"
              disabled={isSubmitting || isUploading || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Comment...
                </>
              ) : (
                "Add Comment"
              )}
            </Button>
          </div>
        </div>

        {isInternal && (
          <p className="text-xs text-gray-500">Internal comments will only be shown to your team members</p>
        )}
      </form>
    </div>
  )
}
