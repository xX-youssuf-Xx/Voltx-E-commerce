import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';

interface TipTapEditorProps {
  content: any;
  onUpdate: (json: any) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        controls: true,
        width: 480,
        height: 320,
      }),
    ],
    content: typeof content === 'string' ? (() => { try { return JSON.parse(content); } catch { return content; } })() : content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && content) {
      const json = typeof content === 'string' ? (() => { try { return JSON.parse(content); } catch { return content; } })() : content;
      editor.commands.setContent(json);
    }
    // eslint-disable-next-line
  }, [content]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b p-3 bg-gray-50">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('bold') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Bold
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('italic') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Italic
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('underline') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Underline
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('bulletList') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Bullet List
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('orderedList') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Numbered List
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().setParagraph().run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('paragraph') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Paragraph
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 }) 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          H2
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 3 }) 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          H3
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          className="px-3 py-2 rounded border text-sm font-medium bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Divider
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().setLink({ href: prompt('URL') || '' }).run()} 
          className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
            editor.isActive('link') 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Link
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          className="px-3 py-2 rounded border text-sm font-medium bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Table
        </button>
        <button 
          type="button" 
          onClick={() => {
            const url = prompt('YouTube URL');
            if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
          }} 
          className="px-3 py-2 rounded border text-sm font-medium bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          YouTube
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-[300px] prose max-w-none" />
    </div>
  );
}; 