import React, { useState, useRef } from 'react';
import { Upload, Image, FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadComplete: (fileData: any) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, onUploadComplete, disabled }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    onFileSelect(file);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.file);
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setUploadProgress(0);
        alert('Upload failed. Please try again.');
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={disabled || isUploading}
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              Images, PDFs, documents up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilePreviewProps {
  file: {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    isImage: boolean;
  };
  onRemove?: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-shrink-0">
        {file.isImage ? (
          <div className="relative">
            <img
              src={file.url}
              alt={file.originalName}
              className="w-12 h-12 object-cover rounded"
            />
            <Image className="absolute inset-0 w-4 h-4 m-auto text-white bg-black/50 rounded" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>
      
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.originalName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(file.size)}
        </p>
      </div>
      
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
