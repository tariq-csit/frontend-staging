import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { User, Attachment } from "@/types/types"
import { DownloadIcon, Trash2, ZoomIn, ZoomOut, MoveHorizontal, FileText } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentCardProps {
  author: User
  content: string
  createdAt: string
  internal?: boolean
  attachments?: Attachment[]
}

export default function CommentCard({ author, content, createdAt, internal = false, attachments }: CommentCardProps) {
  const [open, setOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  console.log(attachments)

  return (
    <div
      className={cn(
        "p-4 rounded-lg flex flex-col gap-2",
        internal
          ? "bg-[#f5f3ff] border-2 border-[#7e22ce]" // Light purple for internal comments
          : "bg-white", // White with purple border for regular comments
      )}
    >
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Avatar>
              <AvatarImage src={author.profilePicture || "/placeholder.svg"} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{author.name}</span>
            {internal && <span className="px-3 py-1 text-xs bg-[#a78bfa] text-white rounded-full">Internal</span>}
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      <div className="text-gray-800">{content}</div>

      <div className="flex gap-4 w-full overflow-x-auto">
      {attachments && attachments.map((attachment) => (
        <div key={attachment.id} className="border rounded p-2 flex items-center gap-2">
          {attachment.url.includes(".png") || attachment.url.includes(".jpg") || attachment.url.includes(".jpeg") ? (
            <div className="relative group w-fit">
                <img src={attachment.url} alt={attachment.name} className="max-w-40 h-auto border border-gray-400 rounded-md" onClick={() => {
                    setSelectedAttachment(attachment);
                    setOpen(true);
                }} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button onClick={() => window.open(attachment.url, "_blank")} variant="default" size="icon">
                        <DownloadIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors group cursor-pointer" onClick={() => window.open(attachment.url, '_blank')}>
              <div className="bg-red-100 p-1.5 rounded-md">
                <FileText className="h-4 w-4 text-red-500" />
              </div>
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-700 group-hover:text-primary truncate"
                onClick={(e) => e.preventDefault()}
              >
                {attachment.name}
              </a>
            </div>
          )}
        </div>
      ))}
      </div>
      <ImagePreview url={selectedAttachment?.url ?? ""} open={open} setOpen={setOpen} />
    </div>
  )
}

export function ImagePreview({ url, open, setOpen }: { url: string, open?: boolean, setOpen?: (open: boolean) => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 }); // Reset position when almost at original size
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogTitle className="flex items-center justify-between">
          <span>Image Preview</span>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= 4}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </DialogTitle>
        <DialogDescription className="relative overflow-hidden">
          <div
            className={cn(
              "relative cursor-move transition-transform",
              scale === 1 && "cursor-default"
            )}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s"
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              src={url} 
              alt="Preview" 
              className="max-w-full mx-auto h-auto"
              style={{ 
                maxHeight: "70vh",
                objectFit: "contain"
              }}
            />
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
