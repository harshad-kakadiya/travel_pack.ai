import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Save,
  Undo,
  Redo,
  Eye,
  FileText,
  Minus,
  Palette
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Define the toolbar buttons configuration
const toolbarButtons = [
  { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
  { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
  { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
  { icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
  { separator: true },
  { icon: Type, command: 'fontSize', title: 'Font Size', dropdown: true },
  { icon: Palette, command: 'foreColor', title: 'Text Color' },
  { separator: true },
  { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  { icon: List, command: 'insertUnorderedList', title: 'Bulleted List' },
  { icon: Quote, command: 'formatBlock', param: 'blockquote', title: 'Blockquote' },
  { separator: true },
  { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
  { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
  { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  { icon: AlignJustify, command: 'justifyFull', title: 'Justify' },
  { separator: true },
  { icon: Link, command: 'createLink', title: 'Insert Link' },
  { separator: true },
  { icon: Code, command: 'formatBlock', param: 'pre', title: 'Code Block' },
  { icon: Minus, command: 'insertHorizontalRule', title: 'Horizontal Rule' },
  { separator: true },
  { icon: Undo, command: 'undo', title: 'Undo (Ctrl+Z)' },
  { icon: Redo, command: 'redo', title: 'Redo (Ctrl+Y)' },
];

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your blog post...", 
  className = "",
  disabled = false 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isRichMode, setIsRichMode] = useState(true);
  const [htmlContent, setHtmlContent] = useState(content);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    setHtmlContent(content);
  }, [content]);

  // Keep the editable div in sync with incoming content when in Rich mode
  useEffect(() => {
    if (editorRef.current && isRichMode) {
      editorRef.current.innerHTML = htmlContent || '';
    }
  }, [htmlContent, isRichMode]);

  const executeCommand = (command: string, param?: string) => {
    if (!editorRef.current) return;
    
    // Save state before command for undo functionality
    saveUndoState();
    
    document.execCommand(command, false, param || '');
    
    // Focus back to editor
    editorRef.current.focus();
    
    // Trigger change event
    handleContentChange();
  };

  const formatBlock = (blockType: string) => {
    executeCommand('formatBlock', blockType);
  };

  const insertHTML = (html: string) => {
    if (!editorRef.current) return;
    
    saveUndoState();
    document.execCommand('insertHTML', false, html);
    editorRef.current.focus();
    handleContentChange();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = window.getSelection()?.toString() || url;
      insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter alt text (optional):') || '';
      insertHTML(`<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`);
    }
  };

  const insertHorizontalRule = () => {
    insertHTML('<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;" />');
  };

  const saveUndoState = () => {
    if (!editorRef.current) return;
    
    const currentContent = editorRef.current.innerHTML;
    setUndoStack(prev => [...prev, currentContent]);
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  const undo = () => {
    if (undoStack.length === 0 || !editorRef.current) return;
    
    const prevContent = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, editorRef.current!.innerHTML]);
    setUndoStack(prev => prev.slice(0, -1));
    
    editorRef.current.innerHTML = prevContent;
    handleContentChange();
    editorRef.current.focus();
  };

  const redo = () => {
    if (redoStack.length === 0 || !editorRef.current) return;
    
    const nextContent = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, editorRef.current!.innerHTML]);
    setRedoStack(prev => prev.slice(0, -1));
    
    editorRef.current.innerHTML = nextContent;
    handleContentChange();
    editorRef.current.focus();
  };

  const handleContentChange = () => {
    if (!editorRef.current) return;
    
    const newContent = editorRef.current.innerHTML;
    setHtmlContent(newContent);
    onChange(newContent);
  };

  const toggleMode = () => {
    setIsRichMode(!isRichMode);
    
    if (!isRichMode && editorRef.current) {
      // Switch to rich mode
      editorRef.current.innerHTML = htmlContent;
      editorRef.current.contentEditable = 'true';
      editorRef.current.focus();
    } else if (isRichMode && editorRef.current) {
      // Switch to HTML mode
      editorRef.current.innerHTML = `<pre style="font-family: monospace; white-space: pre-wrap; padding: 16px; background: #f9fafb; border-radius: 8px; font-size: 14px; line-height: 1.5;">${htmlContent}</pre>`;
      editorRef.current.contentEditable = 'false';
    }
  };

  const insertCodeBlock = () => {
    const code = prompt('Enter code:');
    if (code) {
      const language = prompt('Enter language (optional):') || '';
      const langAttr = language ? ` class="language-${language}"` : '';
      insertHTML(`<pre><code${langAttr}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    }
  };

  const fontSizeChange = () => {
    const size = prompt('Enter font size (e.g., 14px, 16px, 18px, 20px, 24px):') || '16px';
    executeCommand('fontSize', '7'); // TinyMCE uses 1-7 for font sizes, but we'll use CSS
    
    // Apply custom font size via CSS
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = size;
        range.surroundContents(span);
        handleContentChange();
      }
    }
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar border border-gray-300 bg-white rounded-t-lg p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.separator) {
            return (
              <div key={index} className="w-px h-8 bg-gray-300 mx-1" />
            );
          }

          const IconComponent = button.icon!;
          const handleClick = () => {
            switch (button.command) {
              case 'createLink':
                insertLink();
                break;
              case 'insertHorizontalRule':
                insertHorizontalRule();
                break;
              case 'formatBlock':
                if (button.param === 'pre') {
                  insertCodeBlock();
                } else {
                  formatBlock(button.param!);
                }
                break;
              case 'foreColor':
                const color = prompt('Enter color (e.g., #ff0000, red, rgb(255,0,0)):') || '#000000';
                executeCommand('foreColor', color);
                break;
              case 'fontSize':
                fontSizeChange();
                break;
              default:
                executeCommand(button.command!, button.param);
                break;
            }
          };

          return (
            <button
              key={index}
              type="button"
              onClick={handleClick}
              disabled={disabled}
              title={button.title}
              className={`
                p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <IconComponent className="w-4 h-4" />
            </button>
          );
        })}
        
        <div className="w-px h-8 bg-gray-300 mx-2" />
        
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={undo}
          disabled={undoStack.length === 0 || disabled}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            undoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Undo className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0 || disabled}
          title="Redo (Ctrl+Y)"
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            redoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        {/* Mode Toggle */}
        <button
          type="button"
          onClick={toggleMode}
          disabled={disabled}
          className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
          title={isRichMode ? 'Switch to HTML view' : 'Switch to Rich Text view'}
          >
          {isRichMode ? <Code className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span className="text-xs">{isRichMode ? 'HTML' : 'Rich'}</span>
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={isRichMode && !disabled}
        suppressContentEditableWarning={true}
        className={`
          editor border-x border-b border-gray-300 rounded-b-lg p-4 min-h-96 outline-none
          ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          ${isRichMode ? '' : 'font-mono text-sm'}
        `}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: isRichMode ? 'system-ui, -apple-system, sans-serif' : 'monospace'
        }}
        onInput={handleContentChange}
        onKeyDown={(e) => {
          if (disabled) return;
          
          // Handle keyboard shortcuts
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 'b':
                e.preventDefault();
                executeCommand('bold');
                break;
              case 'i':
                e.preventDefault();
                executeCommand('italic');
                break;
              case 'u':
                e.preventDefault();
                executeCommand('underline');
                break;
              case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                  redo();
                } else {
                  undo();
                }
                break;
              case 'y':
                e.preventDefault();
                redo();
                break;
            }
          }
          
          // Handle Enter key for better formatting
          if (e.key === 'Enter') {
            if (e.shiftKey) {
              // Allow Shift+Enter for line breaks
              return;
            } else {
              // Handle block-level elements
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const currentBlock = range.startContainer.parentElement;
                
                // If we're in a heading, create a paragraph after it
                if (currentBlock && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentBlock.tagName)) {
                  e.preventDefault();
                  const newParagraph = document.createElement('p');
                  newParagraph.innerHTML = '<br>';
                  currentBlock.parentNode?.insertBefore(newParagraph, currentBlock.nextSibling);
                  const newRange = document.createRange();
                  newRange.setStart(newParagraph, 0);
                  newRange.setEnd(newParagraph, 0);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                }
              }
            }
          }
        }}
        dangerouslySetInnerHTML={isRichMode ? undefined : { __html: `<pre style="white-space: pre-wrap;">${htmlContent}</pre>` }}
        data-placeholder={placeholder}
      />

      {/* Placeholder */}
      {!content && isRichMode && (
        <div className="absolute top-20 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Word Count and Info */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Words: {htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
          </span>
          <span>
            Characters: {htmlContent.replace(/<[^>]*>/g, '').length}
          </span>
        </div>
        <div>
          {isRichMode ? 'Rich Text Mode' : 'HTML Mode'}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .rich-text-editor .editor:focus {
          ring: 2px solid #3b82f6;
          ring-opacity: 50%;
        }
        
        .rich-text-editor .editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-text-editor .editor p {
          margin-bottom: 1rem;
        }
        
        .rich-text-editor .editor h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1.5rem 0 1rem 0;
        }
        
        .rich-text-editor .editor h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1.25rem 0 0.75rem 0;
        }
        
        .rich-text-editor .editor h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
        }
        
        .rich-text-editor .editor blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .rich-text-editor .editor ul, .rich-text-editor .editor ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .rich-text-editor .editor li {
          margin-bottom: 0.25rem;
        }
        
        .rich-text-editor .editor pre {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: monospace;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        .rich-text-editor .editor code {
          background: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        
        .rich-text-editor .editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-text-editor .editor a:hover {
          color: #1d4ed8;
        }
        
        .rich-text-editor .editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .rich-text-editor .toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .rich-text-editor .toolbar button:active {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;