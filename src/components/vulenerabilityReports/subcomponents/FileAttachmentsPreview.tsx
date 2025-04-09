import React from "react";
import { Attachment } from "@/types/types";
import { DownloadIcon } from "@radix-ui/react-icons";
// Helper function to format file size
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} Bytes`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const FileAttachmentPreview: React.FC<{attachments: Attachment[]}> = ({ attachments }) => {
  // If attachments is undefined or empty
  if (!attachments || attachments.length === 0) {
    return <div className="text-gray-500">No attachments available.</div>;
  }

  // Handle file download when attachment is clicked
  const handleDownload = (attachment: Attachment) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    // Append to the document
    document.body.appendChild(link);
    // Trigger the download
    link.click();
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div className="attachments-container hover:cursor-pointer">
      <div className="flex gap-4">
        {attachments.map((attachment, index) => {
          const fileType = attachment.contentType ? attachment.contentType.split("/")[1]?.toUpperCase() : "FILE";

          return (
            <div
              key={index}
              className="attachment-item border rounded-lg p-4 w-40 text-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => handleDownload(attachment)}
            >
              {/* File Type Icon */}
              <div className="file-icon mb-2">
                {fileType === "PDF" ? (
                  <div className="bg-red-500 text-white font-bold p-2 rounded">PDF</div>
                ) : (
                  <div className="bg-orange-400 text-white flex items-center justify-center gap-2 font-bold p-2 rounded">
                    <span className="text-xs">{fileType}</span>
                    <DownloadIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              {/* File Details */}
              <p className="file-name text-sm font-medium truncate">{attachment.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileAttachmentPreview;
