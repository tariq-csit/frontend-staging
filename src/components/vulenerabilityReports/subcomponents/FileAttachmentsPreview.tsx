import React, { useState } from "react";
import { Attachment } from "@/types/types";
import { DownloadIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Helper function to format file size
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} Bytes`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

interface ImagePreviewProps {
  url: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

function ImagePreview({ url, open, setOpen }: ImagePreviewProps) {
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
      setPosition({ x: 0, y: 0 });
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
          <div className="flex gap-2">
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

const FileAttachmentPreview: React.FC<{attachments: Attachment[]}> = ({ attachments }) => {
  const [open, setOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  if (!attachments || attachments.length === 0) {
    return <div className="text-gray-500">No attachments available.</div>;
  }

  const handleDownload = (attachment: Attachment) => {
    window.open(attachment.url, "_blank");
  };

  return (
    <div className="attachments-container">
      <div className="flex gap-4 w-full overflow-x-auto pb-2">
        {attachments.map((attachment, index) => {
          const isImage = attachment.contentType?.startsWith("image/");
          const fileType = attachment.contentType ? attachment.contentType.split("/")[1]?.toUpperCase() : "FILE";

          return (
            <div
              key={index}
              className="attachment-item min-w-[200px] border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {isImage ? (
                <div className="relative group">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-32 object-cover cursor-pointer break-words max-w-[200px]"
                    onClick={() => {
                      setSelectedAttachment(attachment);
                      setOpen(true);
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment);
                      }}
                      variant="default"
                      size="icon"
                      className="bg-white/80 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="text-center p-4">
                    <div className="bg-blue-500 text-white dark:text-gray-100 font-bold p-3 rounded-lg inline-flex items-center gap-2 mb-2">
                      <span>{fileType}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 border-t">
                <p className="font-medium text-sm truncate mb-1 break-words max-w-[200px]" title={attachment.name}>
                  {attachment.name}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-100">
                    {attachment.size && formatFileSize(attachment.size)}
                  </span>
                  <Button
                    onClick={() => handleDownload(attachment)}
                    variant="ghost"
                    size="icon"
                    className="text-xs"
                  >
                    <DownloadIcon />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ImagePreview
        url={selectedAttachment?.url ?? ""}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default FileAttachmentPreview;
