"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Paperclip, Trash, Loader2 } from "lucide-react"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

interface File {
  name: string
  url: string
}

async function uploadFiles(files: FileList): Promise<Array<{url: string, name: string}>> {
  const uploadPromises = Array.from(files).map(async (file) => {
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const response = await axiosInstance.post(apiRoutes.uploadVulnerabilityAttachment, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          
        },
      });
      const fileData = response.data;
      return {
        url: fileData.url,
        name: fileData.name
      };
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error in batch file upload:', error);
    throw error;
  }
}

export default function CommentBox({ pentestId, vulnerabilityId, refetch }: { pentestId: string, vulnerabilityId: string, refetch: () => void }) {
  const [isInternal, setIsInternal] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [comment, setComment] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const { mutate: addComment, isPending: isSubmitting } = useMutation({
    mutationFn: (data: { comment: string, internal: boolean, attachments: File[] }) => 
      axiosInstance.post(apiRoutes.pentests.vulnerabilities.comment(pentestId, vulnerabilityId), data),
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
    addComment({ comment, internal: isInternal, attachments: files })
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-md bg-background text-foreground border border-gray-200">
          <div className="mt-2">
            {files.length > 0 && (
              <div className="flex flex-nowrap px-4 py-2 space-x-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 w-fit p-2 border border-gray-200 rounded-md shadow-sm">
                    <Paperclip className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
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
            placeholder="Add Comment..."
            className="min-h-[30px] p-4 border-none bg-transparent text-foreground resize-none focus-visible:ring-0 focus-visible:ring-offset-0" 
            value={comment} 
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          /> 
          <input
            type="file"
            multiple
            className="absolute right-4 top-4 text-gray-400 hover:text-primary-900 transition-all duration-300"
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
              <Paperclip className="h-5 w-5 group-hover:text-primary transition-all duration-300" />
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
            <Label htmlFor="internal-comment" className="text-sm text-gray-500">
              Make internal comment
            </Label>
          </div>

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

        {isInternal && (
          <p className="text-xs text-gray-500">Internal comments will only be shown to your team members</p>
        )}
      </form>
    </div>
  )
}
