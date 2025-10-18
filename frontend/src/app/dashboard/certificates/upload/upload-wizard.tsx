'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Upload, FileText, X, Check, AlertCircle, Loader2, ChevronLeft, ChevronRight, CheckCircle, Camera } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/client';

// Validation schema
const certificateSchema = z.object({
  // Step 1: File upload
  file: z.any().refine((file) => file instanceof File, 'Certificate file is required'),
  
  // Step 2: Certificate details
  name: z.string().min(1, 'Certificate name is required'),
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  certificateType: z.string().min(1, 'Certificate type is required'),
  issuer: z.string().min(1, 'Issuer name is required'),
  issuedTo: z.string().min(1, 'Issued to field is required'),
  issuedDate: z.string().min(1, 'Issued date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  scope: z.string().optional(),
  description: z.string().optional(),
  
  // Step 3: Review
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

// Certificate types for the dropdown
const CERTIFICATE_TYPES = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'GOTS',
  'OCS',
  'Fair Trade',
  'BSCI',
  'SMETA',
  'Other',
];

// Supported languages for OCR
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

export default function UploadCertificateWizard() {
  const router = useRouter();
  const { toast } = useToast();
  // Component state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ text: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup with react-hook-form and zod
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      name: '',
      certificateNumber: '',
      certificateType: '',
      issuer: '',
      issuedTo: '',
      issuedDate: '',
      expiryDate: '',
      scope: '',
      description: '',
      termsAccepted: false,
    },
  });
  
  // Form methods
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    getValues,
    reset
  } = form;
  const file = watch('file');
  
  // Navigation handlers
  const handleNext = async () => {
    if (currentStep < wizardSteps.length) {
      const isStepValid = await trigger();
      if (isStepValid) {
        setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length));
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => Math.max(1, prev - 1));
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  // Process the selected file
  const processFile = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, JPEG, or PNG file',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Set file in form
      setValue('file', file, { shouldValidate: true });
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      // Process with OCR if this is the first step
      if (currentStep === 1) {
        processWithOcr(file);
      }
      
      return true;
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the selected file',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  // Process file with OCR
  const processWithOcr = async (file: File) => {
    try {
      setIsProcessingOcr(true);
      
      // In a real app, you would call your backend API for OCR processing
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate OCR result
      const mockOcrResult = {
        text: 'SAMPLE CERTIFICATE\nCertificate Number: CERT-12345\nIssued To: Sample Company\nIssuer: Certification Authority\nIssue Date: 2023-01-15\nExpiry Date: 2025-01-14',
        confidence: 0.92,
        extractedFields: {
          certificateNumber: 'CERT-12345',
          issuedTo: 'Sample Company',
          issuer: 'Certification Authority',
          issueDate: '2023-01-15',
          expiryDate: '2025-01-14',
        },
      };
      
      setOcrResult(mockOcrResult);
      
      // Auto-fill form fields if OCR was successful
      if (mockOcrResult.extractedFields) {
        const { extractedFields } = mockOcrResult;
        setValue('certificateNumber', extractedFields.certificateNumber || '');
        setValue('issuedTo', extractedFields.issuedTo || '');
        setValue('issuer', extractedFields.issuer || '');
        setValue('issuedDate', extractedFields.issueDate || '');
        setValue('expiryDate', extractedFields.expiryDate || '');
        
        // Try to guess certificate type from issuer
        const issuer = extractedFields.issuer?.toLowerCase() || '';
        if (issuer.includes('iso 9001') || issuer.includes('quality')) {
          setValue('certificateType', 'ISO 9001');
        } else if (issuer.includes('iso 14001') || issuer.includes('environment')) {
          setValue('certificateType', 'ISO 14001');
        } else if (issuer.includes('iso 45001') || issuer.includes('safety')) {
          setValue('certificateType', 'ISO 45001');
        }
      }
      
    } catch (error) {
      console.error('Error processing file with OCR:', error);
      toast({
        title: 'Error processing file',
        description: 'There was an error processing your file with OCR. Please check the file and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingOcr(false);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };
  
  // Handle camera capture
  const handleCameraClick = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to take a photo of your certificate',
        variant: 'destructive',
      });
      setIsCameraOpen(false);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            processFile(file);
          }
        }, 'image/jpeg', 0.9);
      }
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsCameraOpen(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: CertificateFormValues) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would upload the file and submit the form data to your API
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('certificateNumber', data.certificateNumber);
      formData.append('certificateType', data.certificateType);
      formData.append('issuer', data.issuer);
      formData.append('issuedTo', data.issuedTo);
      formData.append('issuedDate', data.issuedDate);
      formData.append('expiryDate', data.expiryDate);
      if (data.scope) formData.append('scope', data.scope);
      if (data.description) formData.append('description', data.description);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: 'Certificate uploaded successfully',
        description: 'Your certificate has been uploaded and processed.',
      });
      
      // Redirect to certificates list
      router.push('/dashboard/certificates');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error uploading certificate',
        description: 'There was an error uploading your certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle next button click
  const handleNext = async () => {
    // Validate current step before proceeding
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await trigger(['file']);
    } else if (currentStep === 2) {
      isValid = await trigger([
        'name',
        'certificateNumber',
        'certificateType',
        'issuer',
        'issuedTo',
        'issuedDate',
        'expiryDate',
      ]);
    } else if (currentStep === 3) {
      isValid = await trigger(['termsAccepted']);
      if (isValid) {
        await handleSubmit(onSubmit)();
        return; // Don't proceed to next step, form submission will handle navigation
      }
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  // Handle previous button click
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Step 1: Upload Certificate
  const renderStep1 = () => {
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Certificate</h3>
        <p className="text-sm text-muted-foreground">
          Upload a scanned copy of your certificate in PDF, JPG, or PNG format.
        </p>
      </div>
      
      <div className="space-y-4">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary/50',
            errors.file ? 'border-destructive' : 'border-border'
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, or PNG (max 10MB)
            </p>
            {errors.file && (
              <p className="text-sm font-medium text-destructive">
                {errors.file.message?.toString()}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleCameraClick}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take a Photo
        </Button>
        
        {isCameraOpen && (
          <div className="mt-4 space-y-2">
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                  }
                  setIsCameraOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={captureImage}
              >
                Capture
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {file && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setValue('file', undefined as any);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isProcessingOcr && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing document with AI...</span>
            </div>
          )}
          
          {ocrResult && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Document processed successfully</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Confidence: {(ocrResult.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}
      
      {previewUrl && file?.type.startsWith('image/') && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="border rounded-md overflow-hidden">
            <img
              src={previewUrl}
              alt="Certificate preview"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
      )}
      
      {ocrResult?.text && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Extracted Text</h4>
          <div className="p-4 bg-muted/50 rounded-md text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
            {ocrResult.text}
          </div>
        </div>
      )}
    </div>
  )};
  
  // Step 2: Certificate Details
  const renderCertificateDetailsStep = ({
    register,
    errors,
    isUploading,
    certificateTypes
  }: {
    register: any;
    errors: any;
    isUploading: boolean;
    certificateTypes: string[];
  }) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Certificate Details</h3>
        <p className="text-sm text-muted-foreground">
          Review and edit the extracted information from your certificate.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Certificate Name *</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.name,
                })}
                {...register('name')}
                placeholder="e.g., ISO 9001:2015 Certification"
                disabled={isUploading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate Number *</Label>
            <div className="relative">
              <Input
                id="certificateNumber"
                type="text"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.certificateNumber,
                })}
                {...register('certificateNumber')}
                placeholder="e.g., CER-123456"
                disabled={isUploading}
              />
              {errors.certificateNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.certificateNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificateType">Certificate Type *</Label>
            <Select
              onValueChange={(value) => setValue('certificateType', value)}
              value={watch('certificateType')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a certificate type" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.certificateType && (
              <p className="mt-1 text-sm text-red-500">{errors.certificateType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer *</Label>
            <div className="relative">
              <Input
                id="issuer"
                type="text"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.issuer,
                })}
                {...register('issuer')}
                placeholder="e.g., International Organization for Standardization"
                disabled={isUploading}
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-500">{errors.issuer.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuedTo">Issued To *</Label>
            <div className="relative">
              <Input
                id="issuedTo"
                type="text"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.issuedTo,
                })}
                {...register('issuedTo')}
                placeholder="e.g., Textile Company Inc."
                disabled={isUploading}
              />
              {errors.issuedTo && (
                <p className="mt-1 text-sm text-red-500">{errors.issuedTo.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuedDate">Issued Date *</Label>
            <div className="relative">
              <Input
                id="issuedDate"
                type="date"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.issuedDate,
                })}
                {...register('issuedDate')}
                max={new Date().toISOString().split('T')[0]}
                disabled={isUploading}
              />
              {errors.issuedDate && (
                <p className="mt-1 text-sm text-red-500">{errors.issuedDate.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <div className="relative">
              <Input
                id="expiryDate"
                type="date"
                className={cn({
                  'border-red-500 focus-visible:ring-red-500': errors.expiryDate,
                })}
                {...register('expiryDate')}
                min={new Date().toISOString().split('T')[0]}
                disabled={isUploading}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500">{errors.expiryDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                placeholder="e.g., Manufacturing of textile products"
                {...register('scope')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional information about this certificate"
              className="min-h-[100px]"
              {...register('description')}
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="autoRenew"
                className="mt-1"
              />
              <label htmlFor="autoRenew" className="text-sm">
                Set up automatic renewal reminders 30 days before expiry
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )};
  
  // Step 3: Review & Submit
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review all the information before submitting your certificate.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 border-b">
            <h4 className="font-medium">Certificate Information</h4>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Certificate Name</p>
                <p className="font-medium">{watch('name') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificate Number</p>
                <p className="font-medium">{watch('certificateNumber') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificate Type</p>
                <p className="font-medium">{watch('certificateType') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issuer</p>
                <p className="font-medium">{watch('issuer') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued To</p>
                <p className="font-medium">{watch('issuedTo') || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued Date</p>
                <p className="font-medium">
                  {watch('issuedDate') ? format(new Date(watch('issuedDate')), 'PPP') : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-medium">
                  {watch('expiryDate') ? format(new Date(watch('expiryDate')), 'PPP') : 'Not provided'}
                </p>
              </div>
              {watch('scope') && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Scope</p>
                  <p className="font-medium">{watch('scope')}</p>
                </div>
              )}
              {watch('description') && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="whitespace-pre-line">{watch('description')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="termsAccepted"
              {...register('termsAccepted')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="termsAccepted" className="text-sm">
              I certify that the information provided is accurate and I have the right to upload this certificate.
              {errors.termsAccepted && (
                <p className="text-sm text-red-500 mt-1">{errors.termsAccepted.message}</p>
              )}
            </Label>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              By submitting this form, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Step definitions
  type WizardStep = {
    id: string;
    name: string;
    description: string;
  };

  const wizardSteps: WizardStep[] = [
    { id: 'upload', name: 'Upload', description: 'Upload certificate file' },
    { id: 'details', name: 'Details', description: 'Enter certificate details' },
    { id: 'review', name: 'Review', description: 'Review and submit' },
  ];
  
  // Get current step details
  const currentStepData = wizardSteps[Math.min(currentStep - 1, wizardSteps.length - 1)];
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Upload New Certificate</h2>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {wizardSteps.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of {wizardSteps.length}
          </span>
          <span className="text-xs font-semibold inline-block text-primary">
            {Math.round(((currentStep) / wizardSteps.length) * 100)}%
          </span>
          <span className="text-muted-foreground">
            {currentStepData.description}
          </span>
        </div>
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / wizardSteps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step indicators */}
      <div className="hidden sm:block">
        <nav aria-label="Progress">
          <ol className="grid grid-cols-1 sm:grid-cols-3">
            {wizardSteps.map((step, stepIdx) => (
              <li
                key={step.name}
                className={cn(
                  stepIdx !== wizardSteps.length - 1 ? 'sm:pr-8' : '',
                  'relative'
                )}
              >
                {stepIdx < wizardSteps.length - 1 && (
                  <div
                    className="absolute top-4 right-0 hidden h-0.5 w-full bg-muted sm:block"
                    aria-hidden="true"
                  />
                )}
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                        currentStep > step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep === step.id
                          ? 'border-2 border-primary bg-background'
                          : 'border-2 border-muted-foreground bg-background group-hover:border-muted-foreground/50',
                        currentStep === step.id ? 'border-primary' : ''
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <span
                          className={cn(
                            currentStep === step.id ? 'text-primary' : 'text-muted-foreground',
                            'text-sm font-medium'
                          )}
                        >
                          {step.id}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </span>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                      {wizardSteps[currentStep - 1]?.name}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      
      {/* Form content */}
      <div className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentStep === 1 && 'Upload Certificate'}
                {currentStep === 2 && 'Certificate Details'}
                {currentStep === 3 && 'Review & Submit'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderCertificateDetailsStep({
                register,
                errors,
                isUploading: isSubmitting,
                certificateTypes: CERTIFICATE_TYPES
              })}
              {currentStep === 3 && renderReviewStep()}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-3">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isProcessingOcr}
                  >
                    {isProcessingOcr ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Certificate'
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
