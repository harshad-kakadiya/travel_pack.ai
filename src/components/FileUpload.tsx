import React, { useRef } from 'react';
import { Upload, X, FileText, Image, Loader, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUploadComplete?: (uploadKeys: string[], parsedData?: any[]) => void;
  pendingSessionId?: string;
  disabled?: boolean;
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  onUploadComplete,
  pendingSessionId,
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<{
    success?: boolean;
    message?: string;
    errors?: string[];
  }>({});

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (disabled || uploading) return;
    
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];

    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      // Check file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExt || '')) {
        alert(`File "${file.name}" is not a supported format. Allowed: JPG, PNG, PDF`);
        return;
      }

      // Check total file limit
      if (files.length + validFiles.length >= 10) {
        alert('Maximum 10 files allowed');
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    if (disabled || uploading) return;
    onFilesChange(files.filter((_, i) => i !== index));
    // Clear upload status when files are modified
    setUploadStatus({});
  };

  const handleUploadAndProcess = async () => {
    if (!pendingSessionId || files.length === 0 || uploading) return;

    setUploading(true);
    setUploadStatus({});

    try {
      const { uploadAndProcessFiles } = await import('../lib/supabase');
      
      const result = await uploadAndProcessFiles(files, pendingSessionId);
      
      if (result.success) {
        setUploadStatus({
          success: true,
          message: `Successfully processed ${result.uploadKeys.length} file${result.uploadKeys.length !== 1 ? 's' : ''}`,
          errors: result.errors.length > 0 ? result.errors : undefined
        });
        
        // Notify parent component
        onUploadComplete?.(result.uploadKeys, result.parsedData);
      } else {
        setUploadStatus({
          success: false,
          message: 'Upload and processing failed',
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('Upload and process error:', error);
      setUploadStatus({
        success: false,
        message: 'An unexpected error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setUploading(false);
    }
  };
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext === 'pdf' ? <FileText className="h-6 w-6" /> : <Image className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Booking Confirmations (Optional)
      </label>
      <p className="text-sm text-gray-500 mb-4">
        Upload hotel confirmations, flight tickets, or other travel documents to help personalize your brief.
        Supported formats: JPG, PNG, PDF • Max 10MB per file • Up to 10 files
      </p>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled || uploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        }`}
      >
        {uploading ? (
          <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
        ) : (
          <Upload className={`h-8 w-8 mx-auto mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        )}
        <p className="text-gray-600">
          {uploading ? (
            'Processing files...'
          ) : disabled ? (
            'File upload disabled'
          ) : (
            <>
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        {!uploading && !disabled && (
          <p className="text-sm text-gray-500 mt-1">
            JPG, PNG or PDF up to 10MB each
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload Status */}
      {uploadStatus.message && (
        <div className={`mt-4 p-4 rounded-lg border ${
          uploadStatus.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {uploadStatus.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <p className={`font-medium ${
              uploadStatus.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
          {uploadStatus.errors && uploadStatus.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Issues:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {uploadStatus.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/10)
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-500">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className={`transition-colors ${disabled || uploading ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload and Process Button */}
      {pendingSessionId && files.length > 0 && !uploadStatus.success && (
        <div className="mt-4">
          <button
            onClick={handleUploadAndProcess}
            disabled={uploading || disabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Processing...' : 'Upload & Process Files'}
          </button>
        </div>
      )}
    </div>
  );
}