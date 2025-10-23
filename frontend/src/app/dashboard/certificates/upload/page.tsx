'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { Upload, Camera, FileText, CheckCircle, AlertTriangle, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CERTIFICATE_TYPES = [
  'GOTS',
  'ISO 9001',
  'ISO 14001',
  'OEKO-TEX Standard 100',
  'SA8000',
  'BSCI',
  'Fair Trade',
  'Organic',
  'Other'
];

interface ExtractedData {
  certificate_type: string;
  certificate_number: string;
  issued_by: string;
  issued_to: string;
  issued_date: string;
  expiry_date: string;
  scope: string;
  certificate_holder_address?: string;
}

type Step = 'upload' | 'processing' | 'review';

export default function UploadCertificatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [language, setLanguage] = useState('en');
  const [isDragging, setIsDragging] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    certificate_type: '',
    certificate_number: '',
    issued_by: '',
    issued_to: '',
    issued_date: '',
    expiry_date: '',
    scope: '',
  });
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState('');
  const [certificateId, setCertificateId] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or PDF files.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processUpload = async () => {
    if (!selectedFile) return;

    setCurrentStep('processing');
    setError('');

    try {
      // Simulate processing steps
      const steps = [
        { message: 'Reading certificate text...', duration: 3000 },
        { message: 'Extracting data with AI...', duration: 15000 },
        { message: 'Structuring information...', duration: 8000 },
      ];

      let totalProgress = 0;
      const progressPerStep = 100 / steps.length;

      for (let i = 0; i < steps.length; i++) {
        setProcessingMessage(steps[i].message);
        
        // Simulate progress within each step
        const startProgress = totalProgress;
        const endProgress = startProgress + progressPerStep;
        const stepDuration = steps[i].duration;
        const updateInterval = 100;
        const progressIncrement = progressPerStep / (stepDuration / updateInterval);

        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => {
            const next = prev + progressIncrement;
            return next >= endProgress ? endProgress : next;
          });
        }, updateInterval);

        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        clearInterval(progressInterval);
        totalProgress = endProgress;
      }

      // Upload file to backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiClient.post('/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProcessingProgress(100);
      setProcessingMessage('Completed!');

      // Extract response data
      const data = response.data;
      setCertificateId(data.certificate_id);
      setExtractedData(data.extracted_data);
      setConfidenceScore(data.confidence_score);
      setOcrText(data.ocr_text || '');

      // Move to review step
      setTimeout(() => setCurrentStep('review'), 500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to process certificate. Please try again.');
      setCurrentStep('upload');
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.put(`/api/certificates/${certificateId}`, extractedData);
      
      // Show success and redirect
      router.push('/dashboard/certificates?success=true');
    } catch (err: any) {
      setError('Failed to save certificate. Please try again.');
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'High Confidence';
    if (score >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/certificates" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </Link>
          <h1 className="text-3xl font-bold text-white">Upload Certificate</h1>
          <p className="mt-2 text-gray-400">
            AI will automatically extract data from your certificate in about 30 seconds
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'upload' ? 'bg-blue-600' : 'bg-gray-700'
              }`}>1</div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'processing' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'processing' ? 'bg-blue-600' : 'bg-gray-700'
              }`}>2</div>
              <span className="text-sm font-medium">Processing</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'review' ? 'bg-blue-600' : 'bg-gray-700'
              }`}>3</div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="bg-[#1a2332] rounded-lg border border-gray-800 p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certificate Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
              </select>
            </div>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <Upload className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop your certificate here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse (JPG, PNG, PDF up to 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Choose File
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="bg-[#0f1419] rounded-lg p-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded"
                    />
                  </div>
                )}
                <div className="bg-[#0f1419] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={processUpload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Process Certificate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <div className="bg-[#1a2332] rounded-lg border border-gray-800 p-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-400 mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-medium text-white mb-4">{processingMessage}</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-400">{Math.round(processingProgress)}% Complete</p>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            {/* Confidence Score Banner */}
            <div className="bg-[#1a2332] rounded-lg border border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className={`h-6 w-6 ${getConfidenceColor(confidenceScore)}`} />
                <div>
                  <p className="text-white font-medium">AI Extraction Complete</p>
                  <p className={`text-sm ${getConfidenceColor(confidenceScore)}`}>
                    {getConfidenceLabel(confidenceScore)} ({(confidenceScore * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Review and edit if needed</p>
              </div>
            </div>

            {/* Extracted Data Form */}
            <div className="bg-[#1a2332] rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium text-white mb-6">Certificate Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate Type *
                  </label>
                  <select
                    value={extractedData.certificate_type}
                    onChange={(e) => setExtractedData({ ...extractedData, certificate_type: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select type</option>
                    {CERTIFICATE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate Number *
                  </label>
                  <input
                    type="text"
                    value={extractedData.certificate_number}
                    onChange={(e) => setExtractedData({ ...extractedData, certificate_number: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Enter certificate number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issued By *
                  </label>
                  <input
                    type="text"
                    value={extractedData.issued_by}
                    onChange={(e) => setExtractedData({ ...extractedData, issued_by: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issued To
                  </label>
                  <input
                    type="text"
                    value={extractedData.issued_to}
                    onChange={(e) => setExtractedData({ ...extractedData, issued_to: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issued Date
                  </label>
                  <input
                    type="date"
                    value={extractedData.issued_date}
                    onChange={(e) => setExtractedData({ ...extractedData, issued_date: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={extractedData.expiry_date}
                    onChange={(e) => setExtractedData({ ...extractedData, expiry_date: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scope / Description
                  </label>
                  <textarea
                    value={extractedData.scope}
                    onChange={(e) => setExtractedData({ ...extractedData, scope: e.target.value })}
                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white h-24 resize-none"
                    placeholder="Certification scope or description"
                  />
                </div>
              </div>

              {/* OCR Text Collapsible */}
              {ocrText && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                    View Original OCR Text
                  </summary>
                  <div className="mt-3 bg-[#0f1419] rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {ocrText}
                  </div>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStep('upload');
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
              >
                Upload Another
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
              >
                Save Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
