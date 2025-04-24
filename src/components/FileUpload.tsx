
import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: Record<string, string[]>
  disabled?: boolean
  className?: string
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes,
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileErrors, setFileErrors] = useState<string[]>([])

  // Reset errors when files change
  useEffect(() => {
    setFileErrors([])
  }, [value])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `"${file.name}" is too large. Maximum size is ${formatBytes(maxSize)}.`
    }

    // Check file type if acceptedTypes is provided
    if (acceptedTypes && Object.keys(acceptedTypes).length > 0) {
      const fileType = file.type
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

      let isValidType = false

      // Check if the file type is in the accepted types
      for (const [mimeType, extensions] of Object.entries(acceptedTypes)) {
        if (fileType === mimeType || extensions.includes(fileExtension)) {
          isValidType = true
          break
        }
      }

      if (!isValidType) {
        return `"${file.name}" has an invalid file type.`
      }
    }

    return null
  }

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newErrors: string[] = []
      const newFiles: File[] = [...value]

      // Check if adding these files would exceed the max files limit
      if (newFiles.length + files.length > maxFiles) {
        newErrors.push(`You can only upload a maximum of ${maxFiles} files.`)
        setFileErrors(newErrors)
        return
      }

      // Validate each file
      Array.from(files).forEach((file) => {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
        } else {
          // Check for duplicates
          const isDuplicate = newFiles.some((f) => f.name === file.name && f.size === file.size)
          if (!isDuplicate) {
            newFiles.push(file)
          }
        }
      })

      setFileErrors(newErrors)
      onChange(newFiles)
    },
    [maxFiles, maxSize, acceptedTypes, onChange, value],
  )

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...value]
      newFiles.splice(index, 1)
      onChange(newFiles)
    },
    [onChange, value],
  )

  const acceptedTypesString = acceptedTypes
    ? Object.entries(acceptedTypes)
        .flatMap(([_, extensions]) => extensions)
        .join(", ")
    : undefined

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-60",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleChange}
          accept={acceptedTypesString}
          disabled={disabled || value.length >= maxFiles}
        />

        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UploadCloudIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              Drag & drop files here, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {acceptedTypesString ? `Supported formats: ${acceptedTypesString}` : "All file types supported"}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} file{maxFiles === 1 ? "" : "s"}, up to {formatBytes(maxSize)} each
            </p>
          </div>
        </div>

        {/* Show progress bar when files are being uploaded */}
        {value.length > 0 && value.length < maxFiles && (
          <div className="mt-4 w-full max-w-xs">
            <Progress value={(value.length / maxFiles) * 100} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground text-center">
              {value.length} of {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* Error messages */}
      {fileErrors.length > 0 && (
        <div className="text-sm text-destructive">
          {fileErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
