import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
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
      <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold text-blue-600' : ''}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic text-blue-600' : ''}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'underline text-blue-600' : ''}>U</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</button>
        <button type="button" onClick={() => editor.chain().focus().setLink({ href: prompt('URL') || '' }).run()}>🔗</button>
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</button>
        <button type="button" onClick={() => {
          const url = prompt('YouTube URL');
          if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }}>YT</button>
      </div>
      <EditorContent editor={editor} className="p-3 min-h-[200px]" />
    </div>
  );
}; 