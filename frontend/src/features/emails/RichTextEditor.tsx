import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Link as LinkIcon, Undo, Redo, Quote, Strikethrough, ChevronDown, ChevronsUpDown, IndentDecrease, IndentIncrease, Heading1, Heading2, Heading3, Text } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);
  const formatRef = useRef<HTMLDivElement>(null);
  const alignRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(event.target as Node)) setIsFormatOpen(false);
      if (alignRef.current && !alignRef.current.contains(event.target as Node)) setIsAlignOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Write your email here...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none h-full' },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value && value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex h-full min-h-[300px] flex-col rounded-lg bg-[#fafafa] p-4">
      {/* Pill Toolbar */}
      <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-1.5 shadow-sm border border-gray-100">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="rounded p-1 text-gray-500 hover:text-gray-800 transition-colors"><Undo className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="rounded p-1 text-gray-500 hover:text-gray-800 transition-colors"><Redo className="h-[18px] w-[18px]" /></button>
        
        <div className="mx-1 h-6 w-px bg-gray-200" />
        
        {/* Format Dropdown */}
        <div className="relative" ref={formatRef}>
          <button 
            type="button" 
            onClick={() => setIsFormatOpen(!isFormatOpen)}
            className="flex items-center gap-1.5 rounded p-1 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Type className="h-[18px] w-[18px]" />
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </button>
          {isFormatOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button type="button" onClick={() => { editor.chain().focus().setParagraph().run(); setIsFormatOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"><Text className="h-4 w-4" /> Normal</button>
              <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setIsFormatOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"><Heading1 className="h-4 w-4" /> Heading 1</button>
              <button type="button" onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setIsFormatOpen(false); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50"><Heading2 className="h-4 w-4" /> Heading 2</button>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-gray-200" />
        
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`rounded p-1 transition-colors ${editor.isActive('bold') ? 'text-gray-900 font-bold bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><Bold className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`rounded p-1 transition-colors ${editor.isActive('italic') ? 'text-gray-900 font-bold bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><Italic className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`rounded p-1 transition-colors ${editor.isActive('underline') ? 'text-gray-900 font-bold bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><UnderlineIcon className="h-[18px] w-[18px]" /></button>
        
        <div className="mx-1 h-6 w-px bg-gray-200" />
        
        {/* Align Dropdown */}
        <div className="relative" ref={alignRef}>
          <button 
            type="button" 
            onClick={() => setIsAlignOpen(!isAlignOpen)}
            className="flex items-center gap-1.5 rounded p-1 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <AlignLeft className="h-[18px] w-[18px]" />
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {isAlignOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
              <button type="button" onClick={() => { editor.chain().focus().setTextAlign('left').run(); setIsAlignOpen(false); }} className={`rounded p-1.5 hover:bg-gray-50 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><AlignLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => { editor.chain().focus().setTextAlign('center').run(); setIsAlignOpen(false); }} className={`rounded p-1.5 hover:bg-gray-50 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><AlignCenter className="h-4 w-4" /></button>
              <button type="button" onClick={() => { editor.chain().focus().setTextAlign('right').run(); setIsAlignOpen(false); }} className={`rounded p-1.5 hover:bg-gray-50 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}><AlignRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`rounded p-1 transition-colors ${editor.isActive('orderedList') ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><ListOrdered className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`rounded p-1 transition-colors ${editor.isActive('bulletList') ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><List className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().liftListItem('listItem').run()} className="rounded p-1 text-gray-500 hover:text-gray-800 transition-colors" title="Outdent List"><IndentDecrease className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().sinkListItem('listItem').run()} className="rounded p-1 text-gray-500 hover:text-gray-800 transition-colors" title="Indent List"><IndentIncrease className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`rounded p-1 transition-colors ${editor.isActive('blockquote') ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><Quote className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('Enter URL', previousUrl);
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
          } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }} className={`rounded p-1 transition-colors ${editor.isActive('link') ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><LinkIcon className="h-[18px] w-[18px]" /></button>
        
        <div className="mx-1 h-6 w-px bg-gray-200" />
        
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`rounded p-1 transition-colors ${editor.isActive('strike') ? 'text-gray-900 bg-gray-100' : 'text-gray-500 hover:text-gray-800'}`}><Strikethrough className="h-[18px] w-[18px]" /></button>
      </div>

      <div className="flex-1 cursor-text overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

export default RichTextEditor;
