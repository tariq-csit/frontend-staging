
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import {
  FontBoldIcon,
  FontItalicIcon,
  ListBulletIcon,
  QuoteIcon,
  CodeIcon,
  FileIcon,
} from "@radix-ui/react-icons"
import { Toggle } from '@/components/ui/toggle'
    
const Toolbar = ({editor}: {editor: Editor | null}) => {

  if (!editor) return null

  // for bold, italic, strike, bullet list, ordered list
  return (
    <div className="flex space-x-2 px-2 justify-end">
      <Toggle onPressedChange={() => editor.chain().focus().toggleBold().run()} pressed={editor.isActive("bold")} aria-label="Toggle italic">
        <FontBoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle onPressedChange={() => editor.chain().focus().toggleItalic().run()} pressed={editor.isActive("italic")} aria-label="Toggle italic">
        <FontItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} pressed={editor.isActive("blockquote")} aria-label="Toggle blockquote">
        <QuoteIcon className="h-4 w-4" />
      </Toggle>
      <Toggle onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} pressed={editor.isActive("orderedList")} aria-label="Toggle ordered list">
        <CodeIcon className="h-4 w-4" />
      </Toggle>
      <Toggle>
        <FileIcon className="h-4 w-4" />
      </Toggle>
      <Toggle onPressedChange={() => editor.chain().focus().toggleBulletList().run()} pressed={editor.isActive("bulletList")} aria-label="Toggle bullet list">
        <ListBulletIcon className="h-4 w-4" />
      </Toggle>
    </div>
  )
}

const Tiptap = (props: {
  description: string,
  onChange: (description: string) => void,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-400 pl-4 italic text-gray-600',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 p-2 rounded-md font-mono text-sm',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6',
          }
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing here...', // Set your placeholder text
        emptyEditorClass: 'text-gray-400', // Optional styling for the placeholder
      }),
    ],
    content: props.description,
    editorProps: {
      attributes: {
        class: 'min-h-[200px] border border-input rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      },
    },
    onUpdate({ editor }) {
      props.onChange(editor.getHTML())
    },
  })

  return (
    <div className='flex flex-col gap-2 py-2 border-input border rounded-md'>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className='px-4 py-2'>
        <p className='text-sm'>Embed images by dragging & dropping, selecting, or pasting them.</p>
      </div>
    </div>
  )
}

export default Tiptap
