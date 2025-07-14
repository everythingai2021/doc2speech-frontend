'use client';

import { useState, useRef, useCallback } from 'react';

export const PDFForm = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
    const handleFileSelect = useCallback((selectedFile: File) => {
      if (
        selectedFile.type !== 'application/pdf' &&
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        alert('Please select a PDF or PowerPoint file');
        return;
      }
  
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));
    }, []);
  
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);
  
    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);
  
    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    }, [handleFileSelect]);
  
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    }, [handleFileSelect]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!file) {
        alert('Please select a PDF or PowerPoint file');
        return;
      }
  
      setIsUploading(true);
      setUploadProgress(0);
  
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
  
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setUploadProgress(100);
        
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch("http://127.0.0.1:8000/convert  ", {
            method: "POST",
            body: formData,
        })
        if (!res.ok) {
            const errorData = await res.json();
            console.error("Error:", errorData);
            alert("Failed to convert file: " + errorData.detail);     
        } else {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
        
        setFile(null);
        setUploadProgress(0);
      } catch (error) {
        alert('Upload failed. Please try again.');
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };
  
    const removeFile = () => {
      setFile(null);
      setPdfUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf, .pptx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your PDF or PowerPoint here, or{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF and PowerPoint files up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="mt-2 text-sm text-red-600 hover:text-red-500"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || isUploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !file || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload PDF or PPTX'}
            </button>
          </form>

          {audioUrl && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Audio Preview</h3>
              <audio controls src={audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {pdfUrl && file && file.type === "application/pdf" && (
            <div className="mt-6 flex flex-col items-center bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2 self-start">PDF Preview</h3>
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                style={{ width: '90vw', maxWidth: '1400px', height: '600px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: 'white' }}
              />
            </div>
          )}

          {pdfUrl && file && file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" && (
            <div className="mt-6 flex flex-col items-center bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2 self-start">PPTX Preview</h3>
              <p className="text-gray-700">Preview not available for PowerPoint files.</p>
            </div>
          )}

          {file && !isUploading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">File Details</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {file.type}</p>
                <p><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
    );
};