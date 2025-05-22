import { useEditor, EditorContent, Extension } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { useCallback, useRef, useState, useEffect } from "react"
import { FontBoldIcon, FontItalicIcon, ListBulletIcon, QuoteIcon, CodeIcon, FileIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { Toggle } from "@/components/ui/toggle"
import type React from "react"
import { apiRoutes } from "@/lib/routes"
import axiosInstance from "@/lib/AxiosInstance"
import DOMPurify from 'dompurify'
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Custom extension to prevent unwanted HTML attributes and tags
const SecureNodesExtension = Extension.create({
  name: 'secureNodes',

  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          // Only allow specific attributes for images
          src: {
            default: null,
            parseHTML: (element) => {
              const src = element.getAttribute('src')
              // Only allow specific domains or patterns
              if (src && (
                src.startsWith('https://slash-attachments.s3.us-east-1.amazonaws.com') ||
                src.startsWith('data:image/')
              )) {
                return src
              }
              return null
            },
          },
          alt: {
            default: null,
          },
          title: {
            default: null,
          },
        },
      },
    ]
  },
})

// Function to sanitize HTML content
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_TAGS: ['img'],
    ADD_ATTR: ['target'],
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
  })
}

// Function to upload image and return URL
async function uploadImage(file: File, toast: any): Promise<{ url: string }> {
  const toastId = toast({
    title: "Uploading image...",
    description: "Please wait while we process your image",
  }).id

  try {
    const formData = new FormData()
    formData.append('attachment', file)

    const response = await axiosInstance.post(`${apiRoutes.uploadVulnerabilityAttachment}?context=richtext`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.status !== 200) {
      throw new Error('Failed to upload image')
    }

    toast({
      id: toastId,
      title: "Success",
      description: "Image uploaded successfully",
    })

    return response.data
  } catch (error) {
    toast({
      id: toastId,
      title: "Error",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    })
    throw error
  }
}

// Custom extension to handle markdown preview
const MarkdownImagePreview = Extension.create({
  name: 'markdownImagePreview',

  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          markdown: {
            default: null,
            renderHTML: (attributes) => ({
              'data-markdown': attributes.markdown,
            }),
          },
        },
      },
    ]
  },
})

// Add this near the top with other extensions
const ImageSpacing = Extension.create({
  name: 'imageSpacing',
  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          class: {
            default: 'inline-block mx-1',  // Add horizontal margin around images
          },
        },
      },
    ]
  },
})

const Toolbar = ({ editor, previewMode, onTogglePreview }: { 
  editor: any, 
  previewMode: boolean,
  onTogglePreview: () => void 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && editor) {
      setIsUploading(true)
      try {
        const file = event.target.files[0]
        const { url } = await uploadImage(file, toast)
        const imageName = file.name.replace(/\.[^/.]+$/, "") // Remove file extension
        const markdownText = `![${imageName}](${url})`
        
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: {
            src: url,
            alt: imageName,
            markdown: markdownText,
          },
        }).run()
      } catch (error) {
        console.error('Failed to upload image:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  if (!editor) return null

  return (
    <div className="flex space-x-2 px-2 justify-end">
      <Toggle
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        pressed={editor.isActive("bold")}
        aria-label="Toggle bold"
      >
        <FontBoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        pressed={editor.isActive("italic")}
        aria-label="Toggle italic"
      >
        <FontItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        pressed={editor.isActive("blockquote")}
        aria-label="Toggle blockquote"
      >
        <QuoteIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        pressed={editor.isActive("codeBlock")}
        aria-label="Toggle codeBlock"
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>
      <button 
        onClick={(e) => handleImageClick(e)} 
        aria-label="Add image"
        disabled={isUploading}
        className="relative"
      >
        {isUploading ? (
           <div className="flex gap-2 items-center">
           <span>Uploading...</span>
           <Loader2 className="h-4 w-4 ml-2 animate-spin" />
           </div>
        ) : (
          <FileIcon className="h-4 w-4" />
        )}
      </button>
      <Toggle
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        pressed={editor.isActive("bulletList")}
        aria-label="Toggle bullet list"
      >
        <ListBulletIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        onPressedChange={onTogglePreview}
        pressed={previewMode}
        aria-label="Toggle image preview"
      >
        <EyeOpenIcon className="h-4 w-4" />
      </Toggle>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: "none" }}
        disabled={isUploading}
      />
    </div>
  )
}

const Tiptap = (props: {
  description: string
  onChange: (description: string) => void
}) => {
  const [previewMode, setPreviewMode] = useState(true);
  const [originalContent, setOriginalContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-400 pl-4 italic text-gray-600",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-2 rounded-md font-mono text-sm",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing here...",
        emptyEditorClass: "text-gray-400",
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      SecureNodesExtension,
      MarkdownImagePreview,
    ],
    content: sanitizeHtml(props.description),
    editorProps: {
      attributes: {
        class: "min-h-[200px] border-b border-t border-input dark:bg-gray-900 dark:border-gray-700 rounded-md p-4 focus:outline-none",
      }
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate({ editor }) {
      const sanitizedContent = sanitizeHtml(editor.getHTML());
      props.onChange(sanitizedContent);
    },
  });

  // Update editor content when description prop changes
  useEffect(() => {
    if (editor && props.description !== editor.getHTML()) {
      editor.commands.setContent(sanitizeHtml(props.description), false, {
        preserveWhitespace: 'full'
      });
    }
  }, [editor, props.description]);

  // Add CSS to handle whitespace properly
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror * {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to toggle preview mode
  const togglePreview = useCallback(() => {
    if (!editor) return;

    if (previewMode) {
      // Store current HTML content before switching to markdown
      setOriginalContent(editor.getHTML());
      
      // Convert to markdown
      const content = editor.getHTML();
      const div = document.createElement('div');
      div.innerHTML = content;
      
      const images = div.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        const markdown = `![${img.alt || ''}](${img.src})`;
        const text = document.createTextNode(markdown);
        img.parentNode?.replaceChild(text, img);
      });
      
      editor.commands.setContent(div.innerHTML);
    } else {
      // Restore original HTML content
      editor.commands.setContent(originalContent);
    }

    setPreviewMode(!previewMode);
  }, [previewMode, editor, originalContent]);

  const insertImage = useCallback(async (file: File, imageName: string) => {
    setIsUploading(true)
    try {
      const { url } = await uploadImage(file, toast)
      if (editor) {
        // Validate URL before insertion
        if (!url.startsWith('https://slash-attachments.s3.us-east-1.amazonaws.com')) {
          throw new Error('Invalid image URL')
        }

        const sanitizedName = DOMPurify.sanitize(imageName)
        
        if (previewMode) {
          // Insert image in a paragraph node to ensure proper text handling
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: 'image',
                attrs: {
                  src: url,
                  alt: sanitizedName,
                },
              },
              {
                type: 'paragraph',
              }
            ])
            .run()
        } else {
          // For markdown mode, ensure proper node structure
          const markdownText = `![${sanitizedName}](${url})\n\n`
          editor
            .chain()
            .focus()
            .insertContent(markdownText)
            .run()
        }

        // Ensure cursor is in a proper text node
        editor.commands.createParagraphNear()
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setIsUploading(false)
    }
  }, [editor, previewMode, toast])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        const file = event.dataTransfer.files[0]
        const imageName = file.name.replace(/\.[^/.]+$/, "")
        insertImage(file, imageName)
      }
    },
    [insertImage]
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0]
        const imageName = file.name.replace(/\.[^/.]+$/, "")
        insertImage(file, imageName)
      }
    },
    [insertImage]
  )

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
        event.preventDefault()
        const file = event.clipboardData.files[0]
        insertImage(file, 'Pasted image')
      }
    },
    [insertImage]
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-2 py-2 border-input border dark:border-gray-700 dark:bg-gray-900 rounded-md",
        isUploading && "opacity-70 pointer-events-none"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      <Toolbar editor={editor} previewMode={previewMode} onTogglePreview={togglePreview} />
      <div className="relative">
        <EditorContent editor={editor} />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      <div className="px-4 py-2">
        <p className="text-sm">Embed images by dragging & dropping, selecting, or pasting them.</p>
      </div>
    </div>
  )
}

export default Tiptap

