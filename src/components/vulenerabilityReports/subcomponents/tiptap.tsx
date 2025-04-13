import { useEditor, EditorContent, Extension } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { useCallback, useRef, useState } from "react"
import { FontBoldIcon, FontItalicIcon, ListBulletIcon, QuoteIcon, CodeIcon, FileIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { Toggle } from "@/components/ui/toggle"
import type React from "react"
import { apiRoutes } from "@/lib/routes"
import axiosInstance from "@/lib/AxiosInstance"
import DOMPurify from 'dompurify'

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
                src.startsWith('https://slash-attachments.s3.amazonaws.com') ||
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
async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('attachment', file)

  const response = await axiosInstance.post(`${apiRoutes.uploadVulnerabilityAttachment}/context=richtext`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  if (response.status !== 200) {
    throw new Error('Failed to upload image')
  }

  return response.data
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

const Toolbar = ({ editor, previewMode, onTogglePreview }: { 
  editor: any, 
  previewMode: boolean,
  onTogglePreview: () => void 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && editor) {
      try {
        const file = event.target.files[0]
        const { url } = await uploadImage(file)
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
      }
    }
  }

  const handleImageClick = () => {
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
      <button onClick={handleImageClick} aria-label="Add image">
        <FileIcon className="h-4 w-4" />
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
    </div>
  )
}

const Tiptap = (props: {
  description: string
  onChange: (description: string) => void
}) => {
  const [previewMode, setPreviewMode] = useState(true)

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
        class: "min-h-[200px] border-b border-t border-input rounded-md p-4 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      // Sanitize content before triggering onChange
      const sanitizedContent = sanitizeHtml(editor.getHTML())
      props.onChange(sanitizedContent)
    },
  })

  // Function to toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(!previewMode)
    if (editor) {
      const content = sanitizeHtml(editor.getHTML())
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content

      // Handle all images in the content
      const images = tempDiv.getElementsByTagName('img')
      Array.from(images).forEach((img) => {
        const markdownText = `![${img.alt}](${img.src})`
        if (previewMode) {
          // Switch to markdown mode
          const textNode = document.createTextNode(markdownText)
          img.parentNode?.replaceChild(textNode, img)
        }
      })

      if (previewMode) {
        editor.commands.setContent(tempDiv.innerHTML)
      } else {
        // Switch back to preview mode - restore images from markdown
        const text = editor.getText()
        const markdownRegex = /!\[(.*?)\]\((.*?)\)/g
        let lastIndex = 0
        let newContent = ''

        text.replace(markdownRegex, (match, alt, src, offset) => {
          newContent += text.slice(lastIndex, offset)
          // Ensure the src is sanitized
          if (src && (
            src.startsWith('https://slash-attachments.s3.amazonaws.com') ||
            src.startsWith('data:image/')
          )) {
            newContent += `<img src="${src}" alt="${DOMPurify.sanitize(alt)}" />`
          }
          lastIndex = offset + match.length
          return match
        })

        newContent += text.slice(lastIndex)
        editor.commands.setContent(sanitizeHtml(newContent))
      }
    }
  }, [previewMode, editor])

  const insertImage = useCallback(async (file: File, imageName: string) => {
    try {
      const { url } = await uploadImage(file)
      if (editor) {
        // Validate URL before insertion
        if (!url.startsWith('https://slash-attachments.s3.amazonaws.com')) {
          throw new Error('Invalid image URL')
        }

        const sanitizedName = DOMPurify.sanitize(imageName)
        if (previewMode) {
          editor.chain().focus().insertContent({
            type: 'image',
            attrs: {
              src: url,
              alt: sanitizedName,
            },
          }).run()
        } else {
          const markdownText = `![${sanitizedName}](${url})`
          editor.chain().focus().insertContent(markdownText).run()
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }, [editor, previewMode])

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
      className="flex flex-col gap-2 py-2 border-input border rounded-md"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      <Toolbar editor={editor} previewMode={previewMode} onTogglePreview={togglePreview} />
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
      <div className="px-4 py-2">
        <p className="text-sm">Embed images by dragging & dropping, selecting, or pasting them.</p>
      </div>
    </div>
  )
}

export default Tiptap

