'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Sparkles } from 'lucide-react';

interface CoverLetterEditorProps {
  content: string;
  onChange: (html: string) => void;
  onAiRewrite?: (paragraphText: string, callback: (newText: string) => void) => void;
}

export default function CoverLetterEditor({ content, onChange, onAiRewrite }: CoverLetterEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your cover letter...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4 text-[var(--text-primary)]',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--grid-line)] bg-[var(--bg-elevated)]/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <div className="w-px h-4 bg-[var(--grid-line)] mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered size={14} />
        </ToolbarButton>
        <div className="w-px h-4 bg-[var(--grid-line)] mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={14} />
        </ToolbarButton>

        {onAiRewrite && (
          <>
            <div className="flex-1" />
            <button
              onClick={() => {
                const text = editor.getText();
                onAiRewrite(text, (newText) => {
                  editor.commands.setContent(`<p>${newText}</p>`);
                });
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium text-[var(--gradient-2)] hover:bg-[var(--gradient-2)]/10 transition-colors"
            >
              <Sparkles size={12} />
              Rewrite with AI
            </button>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ children, onClick, active, title }: { children: React.ReactNode; onClick: () => void; active?: boolean; title: string }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[var(--gradient-2)]/15 text-[var(--gradient-2)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
      }`}>
      {children}
    </button>
  );
}
