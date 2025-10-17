'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const certificateSchema = z.object({
  name: z.string().min(1, 'Certificate name is required'),
  issuer: z.string().min(1, 'Issuer name is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

export default function UploadCertificatePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || 
          droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF or image file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: CertificateFormValues) => {
    if (!file) {
      alert('Please upload a certificate file');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Mock API call - would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Simulate successful upload
      setTimeout(() => {
        router.push('/dashboard/certificates');
      }, 500);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload certificate. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Upload Certificate
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload your compliance certificates for verification and risk assessment
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Certificate Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. ISO 9001, GOTS Certification"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="issuer" className="block text-sm font-medium text-gray-700">
                  Issuing Organization
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="issuer"
                    {...register('issuer')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. International Organization for Standardization"
                  />
                  {errors.issuer && (
                    <p className="mt-1 text-sm text-red-600">{errors.issuer.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="expiryDate"
                    {...register('expiryDate')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Certificate Document
                </label>
                <div
                  className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-blue-600">{file.name}</p>
                        <p className="mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,image/*"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF or image up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Uploading Certificate
              </h3>
              <div className="mt-2">
                <div className="relative pt-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="inline-block text-xs font-semibold text-blue-600">
                        {uploadProgress}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="mb-4 flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none"
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {uploadProgress < 100
                      ? 'Uploading and processing your certificate...'
                      : 'Upload complete! Redirecting...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/dashboard/certificates')}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isUploading ? 'Uploading...' : 'Upload Certificate'}
          </button>
        </div>
      </form>
    </div>
  );
}