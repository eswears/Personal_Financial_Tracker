import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../services/api';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'csv';

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Add timeout of 30 seconds
      const uploadPromise = uploadFile(file, fileType);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );
      
      const response = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (response.success) {
        setSuccess(`Successfully uploaded ${response.transactionCount} transactions!`);
        setTimeout(() => {
          onUploadSuccess();
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error details:', err);
      
      if (err.message === 'Upload timeout') {
        setError(`Upload timed out after 30 seconds. Possible reasons:
          • The file is too large (max 10MB)
          • Server is processing slowly
          • Network connection issues
          Please try with a smaller file or check your connection.`);
      } else if (err.response?.status === 500) {
        setError(`Server error (500). Possible reasons:
          • Database connection failed
          • Invalid file format
          • Missing required columns in CSV
          Error: ${err.response?.data?.error || 'Unknown server error'}`);
      } else if (err.response?.status === 413) {
        setError('File too large. Please upload a file smaller than 10MB.');
      } else if (err.response?.status === 400) {
        setError(`Invalid file: ${err.response?.data?.error || 'Please check the file format'}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the server is running on http://localhost:3001');
      } else {
        setError(`Upload failed: ${err.message || 'Unknown error'}
          Please ensure:
          • File is CSV or PDF format
          • File contains transaction data
          • Server is running on port 3001`);
      }
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Processing your file...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Drag & drop your bank statement here, or click to select</p>
            <p className="text-sm text-gray-500">Supports CSV and PDF files</p>
          </div>
        )}
      </div>

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">✅ {success}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <span className="text-red-600 mr-2">❌</span>
            <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};