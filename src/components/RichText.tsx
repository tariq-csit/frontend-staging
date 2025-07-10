import { useState, useRef, useEffect, useCallback } from "react"
import { Remarkable } from "remarkable"
import { Eye, EyeOff, ImagePlus, Loader2, Hash, Type, List, Quote, Code, Link, Table, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"

const md = new Remarkable({
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
  typographer: true
})

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Command menu items for markdown actions
const commandMenuItems = [
  {
    id: "heading1",
    label: "Heading 1",
    icon: Hash,
    syntax: "# ",
    description: "Large heading",
    cursorOffset: 2
  },
  {
    id: "heading2",
    label: "Heading 2", 
    icon: Hash,
    syntax: "## ",
    description: "Medium heading",
    cursorOffset: 3
  },
  {
    id: "heading3",
    label: "Heading 3",
    icon: Hash,
    syntax: "### ",
    description: "Small heading", 
    cursorOffset: 4
  },
  {
    id: "bold",
    label: "Bold",
    icon: Type,
    syntax: "**text**",
    description: "Make text bold",
    cursorOffset: 2,
    selectLength: 4
  },
  {
    id: "italic",
    label: "Italic",
    icon: Type,
    syntax: "*text*",
    description: "Make text italic",
    cursorOffset: 1,
    selectLength: 4
  },
  {
    id: "code",
    label: "Inline Code",
    icon: Code,
    syntax: "`code`",
    description: "Inline code block",
    cursorOffset: 1,
    selectLength: 4
  },
  {
    id: "codeblock",
    label: "Code Block",
    icon: Code,
    syntax: "```\ncode\n```",
    description: "Multi-line code block",
    cursorOffset: 4,
    selectLength: 4
  },
  {
    id: "quote",
    label: "Quote",
    icon: Quote,
    syntax: "> ",
    description: "Add a quote",
    cursorOffset: 2
  },
  {
    id: "unordered-list",
    label: "Bullet List",
    icon: List,
    syntax: "- ",
    description: "Create a bullet list",
    cursorOffset: 2
  },
  {
    id: "ordered-list",
    label: "Numbered List",
    icon: List,
    syntax: "1. ",
    description: "Create a numbered list",
    cursorOffset: 3
  },
  {
    id: "link",
    label: "Link",
    icon: Link,
    syntax: "[text](url)",
    description: "Add a link",
    cursorOffset: 1,
    selectLength: 4
  },
  {
    id: "table",
    label: "Table",
    icon: Table,
    syntax: "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
    description: "Insert a table",
    cursorOffset: 2,
    selectLength: 8
  },
  {
    id: "hr",
    label: "Horizontal Rule",
    icon: Minus,
    syntax: "\n---\n",
    description: "Add a horizontal line",
    cursorOffset: 5
  }
]

// Upload image function similar to the one in tiptap.tsx
async function uploadImage(file: File, toast: any): Promise<{ url: string; name: string }> {
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

// Convert HTML to markdown (improved conversion)
function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === '') return ''
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Handle code blocks first (before other conversions)
  let markdown = tempDiv.innerHTML
  
  // Convert pre/code blocks to markdown (preserve multiline code)
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, content) => {
    // Decode HTML entities and preserve formatting
    const decodedContent = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    return '\n```\n' + decodedContent + '\n```\n'
  })
  
  // Convert inline code before other conversions
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
  
  // Convert other HTML tags to markdown
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
  
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
  
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
  
  // Handle lists more carefully
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (match: string, listContent: string) => `- ${listContent.trim()}\n`)
  })
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let counter = 1
    return content.replace(/<li[^>]*>(.*?)<\/li>/gi, (match: string, listContent: string) => `${counter++}. ${listContent.trim()}\n`)
  })
  
  // Convert tables to markdown (improved)
  markdown = markdown.replace(/<table[^>]*>(.*?)<\/table>/gis, (match, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>.*?<\/tr>/gis) || []
    
    if (rows.length === 0) return ''
    
    let markdownTable = ''
    let isFirstRow = true
    
    rows.forEach((row: string) => {
      const cells = row.match(/<(th|td)[^>]*>(.*?)<\/(th|td)>/gis) || []
      
      if (cells.length === 0) return
      
      const markdownCells = cells.map((cell: string) => {
        const cellContent = cell.replace(/<(th|td)[^>]*>(.*?)<\/(th|td)>/gis, '$2').trim()
        return cellContent
      })
      
      markdownTable += '| ' + markdownCells.join(' | ') + ' |\n'
      
      if (isFirstRow) {
        const separatorCells = markdownCells.map(() => '----------')
        markdownTable += '|' + separatorCells.join('|') + '|\n'
        isFirstRow = false
      }
    })
    
    return '\n' + markdownTable + '\n'
  })
  
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
  markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n')
  
  // Clean up remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '')
  
  // Clean up extra whitespace but preserve code block formatting
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n')
  markdown = markdown.trim()
  
  return markdown
}

interface RichTextProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export default function RichText({ 
  value = "", 
  onChange = () => {}, 
  placeholder = "Start typing your markdown here, drag and drop, or paste images..." 
}: RichTextProps) {
  const [text, setText] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 })
  const [commandFilter, setCommandFilter] = useState("")
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [isPasting, setIsPasting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commandMenuRef = useRef<HTMLDivElement>(null)
  const isUserInputRef = useRef(false)
  const lastValueRef = useRef<string>("")
  const { toast } = useToast()


  // Debounce text changes to prevent flickering during typing
  const debouncedText = useDebounce(text, 150)

  // Convert incoming HTML value to markdown and sync with internal state
  useEffect(() => {
    // Only process external changes if:
    // 1. Component is not yet initialized (initial load)
    // 2. The value has actually changed from what we last processed
    // 3. This is not a user input event
    if (value !== undefined && !isUserInputRef.current && value !== lastValueRef.current) {
      const markdownValue = htmlToMarkdown(value)
      setText(markdownValue)
      lastValueRef.current = value
      setIsInitialized(true)
    } else if (!isInitialized && value !== undefined) {
      // Handle case where initial value is empty string - still need to initialize
      setIsInitialized(true)
    }
    // Reset the flag after processing external changes
    isUserInputRef.current = false
  }, [value, isInitialized])

  // Update parent component when debounced text changes (only from user input)
  useEffect(() => {
    if (isUserInputRef.current && isInitialized) {
      const htmlValue = md.render(debouncedText)
      // Only update parent if the HTML has actually changed
      if (htmlValue !== lastValueRef.current) {
        lastValueRef.current = htmlValue
        onChange(htmlValue)
      }
    }
  }, [debouncedText, onChange, isInitialized])

  // Filter command menu items based on search
  const filteredCommands = commandMenuItems.filter(item =>
    item.label.toLowerCase().includes(commandFilter.toLowerCase()) ||
    item.description.toLowerCase().includes(commandFilter.toLowerCase())
  )

  // Handle key events for command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCommandMenu) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedCommandIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedCommandIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedCommandIndex]) {
            insertCommand(filteredCommands[selectedCommandIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          closeCommandMenu()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showCommandMenu, filteredCommands, selectedCommandIndex])

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedCommandIndex(0)
  }, [commandFilter])

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Reset refs on unmount
      isUserInputRef.current = false
      lastValueRef.current = ""
    }
  }, [])

  // Close command menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandMenuRef.current && !commandMenuRef.current.contains(event.target as Node)) {
        closeCommandMenu()
      }
    }

    if (showCommandMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCommandMenu])

  const validateAndUploadImage = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const { url, name } = await uploadImage(file, toast)
      
      // Insert markdown image syntax at cursor position or at the end
      const imageName = name || file.name.replace(/\.[^/.]+$/, "")
      const markdownImage = `![${imageName}](${url})\n\n`
      
      // Mark this as user input and insert the image markdown
      isUserInputRef.current = true
      setText(prevText => prevText + markdownImage)
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await validateAndUploadImage(file)
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    const cursorPosition = e.target.selectionStart
    
    // Mark this as user input to trigger onChange
    isUserInputRef.current = true
    
    // Set text immediately without any processing
    setText(newText)
    
    // Command menu logic - only process if we detect specific command patterns
    // Add more guards to prevent interference with normal typing
    try {
      // Only handle command menu if the last character is '/' and menu isn't already open
      if (newText[cursorPosition - 1] === '/' && !showCommandMenu) {
        // Only show command menu if '/' is at start of line or after whitespace
        const beforeSlash = newText.substring(0, cursorPosition - 1)
        const lastChar = beforeSlash[beforeSlash.length - 1]
        
        // More restrictive check: only show if truly at beginning of line or after clear whitespace
        if (!lastChar || lastChar === '\n' || (lastChar === ' ' && beforeSlash.trim().endsWith(' '))) {
          showCommandMenuAt(cursorPosition)
        }
      } else if (showCommandMenu) {
        const slashIndex = newText.lastIndexOf('/', cursorPosition)
        
        if (slashIndex !== -1 && slashIndex < cursorPosition) {
          const textAfterSlash = newText.slice(slashIndex + 1, cursorPosition)
          
          // If user typed space, newline, or other breaking characters after '/', close menu
          if (newText[cursorPosition - 1] === ' ' || newText[cursorPosition - 1] === '\n' || newText[cursorPosition - 1] === '\t') {
            closeCommandMenu()
          } else if (textAfterSlash.length <= 20) { // Prevent very long filters
            // Update command filter only if reasonable length
            setCommandFilter(textAfterSlash)
          } else {
            closeCommandMenu()
          }
        } else {
          closeCommandMenu()
        }
      }
    } catch (error) {
      // If any error occurs in command menu logic, just close it and continue
      console.warn('Command menu error:', error)
      closeCommandMenu()
    }
  }

  const showCommandMenuAt = (cursorPosition: number) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const { offsetTop, offsetLeft } = textarea
    
    // Calculate approximate position based on cursor
    const lineHeight = 20
    const charWidth = 8
    const lines = textarea.value.substring(0, cursorPosition).split('\n')
    const currentLine = lines.length - 1
    const currentColumn = lines[lines.length - 1].length
    
    const top = offsetTop + currentLine * lineHeight + 30
    const left = offsetLeft + currentColumn * charWidth

    setCommandMenuPosition({ top, left })
    setShowCommandMenu(true)
    setCommandFilter("")
    setSelectedCommandIndex(0)
  }

  const closeCommandMenu = () => {
    setShowCommandMenu(false)
    setCommandFilter("")
    setSelectedCommandIndex(0)
  }

  const insertCommand = (command: typeof commandMenuItems[0]) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textValue = textarea.value
    
    // Find the slash position
    const slashIndex = textValue.lastIndexOf('/', cursorPosition)
    
    if (slashIndex !== -1) {
      // Replace from slash to cursor with command syntax
      const beforeSlash = textValue.substring(0, slashIndex)
      const afterCursor = textValue.substring(cursorPosition)
      const newText = beforeSlash + command.syntax + afterCursor
      
      // Mark this as user input
      isUserInputRef.current = true
      setText(newText)
      
      // Set cursor position
      setTimeout(() => {
        const newCursorPosition = slashIndex + command.cursorOffset
        textarea.focus()
        textarea.setSelectionRange(newCursorPosition, newCursorPosition + (command.selectLength || 0))
      }, 0)
    }
    
    closeCommandMenu()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set isDragOver to false if we're leaving the textarea itself
    // not just moving between child elements
    if (!textareaRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (isUploading) return

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast({
        title: "No images found",
        description: "Please drop image files only.",
        variant: "destructive",
      })
      return
    }

    if (imageFiles.length > 1) {
      toast({
        title: "Multiple files detected",
        description: "Please drop one image at a time.",
        variant: "destructive",
      })
      return
    }

    await validateAndUploadImage(imageFiles[0])
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (isUploading || isPasting) return

    const clipboardData = e.clipboardData || (window as any).clipboardData
    
    if (!clipboardData) {
      return
    }

    setIsPasting(true)
    
    let imageFound = false

    try {
      // First try to get files from clipboardData.files
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i]
          
          if (file.type.startsWith('image/')) {
            e.preventDefault()
            e.stopPropagation()
            imageFound = true
            await validateAndUploadImage(file)
            break
          }
        }
      }

      // If no files found, try clipboardData.items
      if (!imageFound && clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i]
          
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            e.stopPropagation()
            
            const file = item.getAsFile()
            if (file) {
              imageFound = true
              await validateAndUploadImage(file)
            }
            break
          }
        }
      }

      if (!imageFound) {
        // Show a helpful message to the user
        toast({
          title: "No image detected",
          description: "Copy an image to your clipboard first, then paste it here.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Paste failed",
        description: "There was an error processing the pasted content.",
        variant: "destructive",
      })
    } finally {
      setIsPasting(false)
    }
  }

  const triggerImageUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only handle special keys when command menu is open
    if (showCommandMenu) {
      if (e.key === ' ') {
        closeCommandMenu()
        // Don't prevent default - let the space be typed
      }
      // Don't handle any other keys here to avoid interfering with normal typing
    }
  }

  return (
    <main className="bg-background dark:bg-gray-900 flex flex-col gap-4 text-foreground p-2 border border-border rounded-lg w-full">
      {/* Header with controls */}
      <div className="flex items-center justify-end">   
        <div className="flex items-center gap-2">
          {/* Image Upload Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={triggerImageUpload}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" />
                Image
              </>
            )}
          </Button>
          
          {/* Preview Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              setShowPreview(!showPreview)
            }}
            className="flex items-center gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {/* Main content area - toggles between editor and preview */}
      <div className="w-full relative">
        {showPreview ? (
          /* Preview section */
          <div className="w-full h-[300px] bg-card dark:bg-gray-900 text-card-foreground border border-border rounded-lg shadow-sm p-6 overflow-auto">
            {debouncedText ? (
              <div
                className="prose prose-slate dark:prose-invert max-w-none
                           prose-code:bg-muted dark:prose-code:bg-muted 
                           prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                           prose-pre:bg-muted dark:prose-pre:bg-muted 
                           prose-blockquote:border-border dark:prose-blockquote:border-border
                           prose-hr:border-border dark:prose-hr:border-border 
                           prose-table:border-collapse
                           prose-th:border prose-th:border-border dark:prose-th:border-border prose-th:px-3 prose-th:py-2
                           prose-td:border prose-td:border-border dark:prose-td:border-border prose-td:px-3 prose-td:py-2
                           prose-a:text-primary dark:prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                           hover:prose-a:text-primary/80 dark:hover:prose-a:text-primary/80
                           prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full"
                dangerouslySetInnerHTML={{ __html: md.render(debouncedText) }}
              />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview yet. Switch to edit mode to start writing...</p>
            )}
          </div>
        ) : (
          /* Editor section with drag and drop */
          <div className="relative">
            <textarea
              ref={textareaRef}
              name="textarea"
              id="markdown"
              value={text}
              disabled={isUploading || isPasting}
              onChange={handleTextChange}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              className={`w-full h-[300px] bg-card dark:bg-gray-900 text-card-foreground border border-border rounded-lg shadow-sm p-6 focus:outline-none focus:ring-0 focus:border-border resize-none font-mono text-sm leading-relaxed ${
                isDragOver ? 'border-primary bg-primary/5 border-2' : ''
              } ${isUploading || isPasting ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder={placeholder}
            />
            
            {/* Command Menu */}
            {showCommandMenu && (
              <div
                ref={commandMenuRef}
                className="absolute z-50 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-[300px]"
                style={{ 
                  top: commandMenuPosition.top, 
                  left: Math.min(commandMenuPosition.left, window.innerWidth - 320) 
                }}
              >
                <div className="p-2">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    Type to filter • ↑↓ to navigate • Enter to select • Esc to cancel
                  </div>
                  {filteredCommands.length > 0 ? (
                    filteredCommands.map((command, index) => {
                      const Icon = command.icon
                      return (
                        <div
                          key={command.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            index === selectedCommandIndex 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted dark:hover:bg-gray-700'
                          }`}
                          onClick={() => insertCommand(command)}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{command.label}</div>
                            <div className="text-xs opacity-70 truncate">{command.description}</div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No commands found
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Drag overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 border border-primary/20 shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <ImagePlus className="h-12 w-12 text-primary mb-3" />
                    <p className="text-lg font-medium text-foreground mb-1">Drop your image here</p>
                    <p className="text-sm text-muted-foreground">We'll upload it and add it to your markdown</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Uploading image...</p>
                      <p className="text-xs text-muted-foreground">Please wait while we process your image</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Paste processing overlay */}
            {isPasting && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Processing paste...</p>
                      <p className="text-xs text-muted-foreground">Checking clipboard for images</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground dark:text-gray-600">
          Type <kbd className="px-1 py-0.5 bg-muted rounded text-xs">/</kbd> for commands • <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to dismiss • Drag & drop or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+V</kbd> to paste images • Supports full markdown syntax
        </p>
      </div>
    </main>
  )
}
