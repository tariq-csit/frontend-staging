import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface Comment {
  id: string
  text: string
  images: string[]
  author: {
    name: string
    avatar: string
  }
  timestamp: Date
}

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPreviewImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setPreviewImages([...previewImages, ...newPreviewImages])
      setSelectedImages([...selectedImages, ...Array.from(files).map((file) => file.name)])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim() || previewImages.length > 0) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        text: newComment,
        images: previewImages,
        author: {
          name: "John Doe",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(),
      }
      setComments([...comments, newCommentObj])
      setNewComment("")
      setSelectedImages([])
      setPreviewImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Comments</h2>

      {/* Existing Comments */}
      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{comment.author.name}</h3>
                <p className="text-gray-600 mt-1">{comment.text}</p>
                {comment.images.length > 0 && (
                  <div className="mt-4 grid gap-4">
                    {comment.images.map((image, index) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt="Comment attachment"
                          width={600}
                          height={400}
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full min-h-[100px] p-4 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute bottom-4 right-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Previews */}
        {previewImages.length > 0 && (
          <div className="grid gap-4">
            {previewImages.map((image, index) => (
              <div key={index} className="relative border rounded-lg overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  width={600}
                  height={400}
                  className="object-contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    const newPreviewImages = previewImages.filter((_, i) => i !== index)
                    const newSelectedImages = selectedImages.filter((_, i) => i !== index)
                    setPreviewImages(newPreviewImages)
                    setSelectedImages(newSelectedImages)
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit">Add Comment</Button>
        </div>
      </form>
    </div>
  )
}

