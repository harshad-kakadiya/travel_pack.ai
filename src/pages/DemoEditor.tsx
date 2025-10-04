import React, { useState } from 'react';
import { RichTextEditor } from '../components/RichTextEditor';

export function DemoEditor() {
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Rich Text Editor Demo</h1>
          
          <div className="mb-6">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
          </div>

          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your blog post here..."
            className="mb-6"
            disabled={previewMode}
          />

          {previewMode && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Preview:</h3>
              <div 
                className="blog-content min-h-32 border rounded-lg p-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Preview Styles */}
              <style>{`
                .blog-content {
                  font-size: 18px;
                  line-height: 1.7;
                  color: #374151;
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .blog-content h1 {
                  font-size: 2.5rem;
                  font-weight: 700;
                  margin: 2rem 0 1.5rem 0;
                  color: #111827;
                  line-height: 1.2;
                }
                
                .blog-content h2 {
                  font-size: 2rem;
                  font-weight: 600;
                  margin: 2rem 0 1.25rem 0;
                  color: #111827;
                  line-height: 1.3;
                }
                
                .blog-content h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin: 1.5rem 0 1rem 0;
                  color: #111827;
                  line-height: 1.4;
                }
                
                .blog-content p {
                  margin-bottom: 1.5rem;
                }
                
                .blog-content ul, .blog-content ol {
                  margin: 1.5rem 0;
                  padding-left: 2rem;
                }
                
                .blog-content li {
                  margin-bottom: 0.5rem;
                }
                
                .blog-content blockquote {
                  border-left: 4px solid #3b82f6;
                  background: #f8fafc;
                  padding: 1.5rem;
                  margin: 2rem 0;
                  font-style: italic;
                  color: #475569;
                  border-radius: 0 8px 8px 0;
                }
                
                .blog-content pre {
                  background: #1e293b;
                  color: #e2e8f0;
                  padding: 1.5rem;
                  border-radius: 8px;
                  margin: 2rem 0;
                  overflow-x: auto;
                  font-family: monospace;
                }
                
                .blog-content code {
                  background: #f1f5f9;
                  color: #e11d48;
                  padding: 0.25rem 0.5rem;
                  border-radius: 4px;
                  font-family: monospace;
                  font-size: 0.875em;
                }
                
                .blog-content a {
                  color: #3b82f6;
                  text-decoration: underline;
                  text-decoration-thickness: 2px;
                  text-underline-offset: 2px;
                }
                
                .blog-content a:hover {
                  color: #1d4ed8;
                }
                
                .blog-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 12px;
                  margin: 2rem 0;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
              `}</style>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">HTML Output:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoEditor;