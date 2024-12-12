import React from "react";

// Helper function to format file size
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} Bytes`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// Props definition
interface FileAttachmentPreviewProps {
  attachments?: FileList; // FileList or undefined
}

const FileAttachmentPreview: React.FC<FileAttachmentPreviewProps> = ({ attachments }) => {
  // If attachments is undefined or empty
  if (!attachments || attachments.length === 0) {
    return <div className="text-gray-500">No attachments available.</div>;
  }

  // Map through the FileList and render each file
  const fileArray = Array.from(attachments); // Convert FileList to an array

  return (
    <div className="attachments-container">
      <div className="flex gap-4">
        {fileArray.map((file, index) => {
          const fileType = file.type.split("/")[1]?.toUpperCase();
          const fileSize = formatFileSize(file.size);

          return (
            <div
              key={index}
              className="attachment-item border rounded-lg p-4 w-40 text-center shadow-sm"
            >
              {/* File Type Icon */}
              <div className="file-icon mb-2">
                {fileType === "PDF" ? (
                  <div className="bg-red-500 text-white font-bold p-2 rounded">PDF</div>
                ) : (
                  <div className="bg-orange-400 text-white font-bold p-2 rounded">{fileType}</div>
                )}
              </div>
              {/* File Details */}
              <p className="file-name text-sm font-medium truncate">{file.name}</p>
              <p className="file-size text-gray-500 text-xs">{fileSize}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileAttachmentPreview;
