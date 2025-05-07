import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
}

export default function PDFViewer({ fileUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function nextPage() {
    setPageNumber((v) => Math.min(v + 1, numPages || v));
  }

  function prevPage() {
    setPageNumber((v) => Math.max(v - 1, 1));
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <p className="text-sm text-gray-600">
          Page {pageNumber} of {numPages}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={pageNumber >= (numPages ?? -1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      <div className="flex justify-center" style={{ height: "750px", overflow: "auto" }}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="my-react-pdf"
        >
          <Page 
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={800}
          />
        </Document>
      </div>
    </div>
  );
} 