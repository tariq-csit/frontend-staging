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

// Function to upload image and return URL
async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('attachment', file)

  const response = await axiosInstance.post(apiRoutes.uploadVulnerabilityAttachment, formData, {
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
      MarkdownImagePreview,
    ],
    content: props.description,
    editorProps: {
      attributes: {
        class: "min-h-[200px] border-b border-t border-input rounded-md p-4 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      props.onChange(editor.getHTML())
    },
  })

  // Function to toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(!previewMode)
    if (editor) {
      const images = editor.view.dom.querySelectorAll('img')
      images.forEach((img: HTMLImageElement) => {
        const parent = img.parentElement
        if (parent) {
          const markdown = img.getAttribute('data-markdown')
          if (!previewMode) {
            img.style.display = 'block'
            if (parent.querySelector('.markdown-text')) {
              parent.removeChild(parent.querySelector('.markdown-text')!)
            }
          } else {
            img.style.display = 'none'
            const markdownSpan = document.createElement('span')
            markdownSpan.className = 'markdown-text'
            markdownSpan.style.fontFamily = 'monospace'
            markdownSpan.style.color = '#666'
            markdownSpan.textContent = markdown || `![${img.alt}](${img.src})`
            parent.insertBefore(markdownSpan, img)
          }
        }
      })
    }
  }, [previewMode, editor])

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        try {
          const file = event.dataTransfer.files[0]
          const { url } = await uploadImage(file)
          const imageName = file.name.replace(/\.[^/.]+$/, "")
          const markdownText = `![${imageName}](${url})`
          
          editor?.chain().focus().insertContent({
            type: 'image',
            attrs: {
              src: url,
              alt: imageName,
              markdown: markdownText,
              'data-markdown': markdownText,
            },
          }).run()
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
    },
    [editor],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
        event.preventDefault()
        try {
          const file = event.clipboardData.files[0]
          const { url } = await uploadImage(file)
          const imageName = 'Pasted image'
          const markdownText = `![${imageName}](${url})`
          
          editor?.chain().focus().insertContent({
            type: 'image',
            attrs: {
              src: url,
              alt: imageName,
              markdown: markdownText,
              'data-markdown': markdownText,
            },
          }).run()
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
    },
    [editor],
  )

  return (
    <div
      className="flex flex-col gap-2 py-2 border-input border rounded-md"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
    >
      <Toolbar editor={editor} previewMode={previewMode} onTogglePreview={togglePreview} />
      <div className="relative">
        <EditorContent editor={editor} />
        <style>{`
          .ProseMirror img {
            display: ${previewMode ? 'block' : 'none'};
            max-width: 100%;
            height: auto;
          }
          .markdown-text {
            display: ${previewMode ? 'none' : 'block'};
            white-space: pre-wrap;
            padding: 4px 0;
          }
        `}</style>
      </div>
      <div className="px-4 py-2">
        <p className="text-sm">Embed images by dragging & dropping, selecting, or pasting them.</p>
      </div>
    </div>
  )
}

export default Tiptap

