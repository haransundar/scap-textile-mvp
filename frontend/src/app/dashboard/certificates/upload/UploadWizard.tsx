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

interface UploadWizardProps {
  onComplete?: () => void;
}

export default function UploadCertificateWizard({ onComplete }: UploadWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Component state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ text: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form setup with react-hook-form and zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<CertificateFormValues>({
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

  // Watch form values
  const file = watch('file');
  const name = watch('name');
  const certificateNumber = watch('certificateNumber');
  const certificateType = watch('certificateType');
  const issuer = watch('issuer');
  const issuedTo = watch('issuedTo');
  const issuedDate = watch('issuedDate');
  const expiryDate = watch('expiryDate');
  const scope = watch('scope');
  const description = watch('description');
  
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
  
  // Get current step data
  const currentStepData = wizardSteps[Math.min(currentStep - 1, wizardSteps.length - 1)];
  
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
      
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock OCR result
      const mockOcrResult = {
        text: 'Sample extracted text from certificate...',
        confidence: 0.95
      };
      
      setOcrResult(mockOcrResult);
      
      // Auto-fill some fields based on OCR result (in a real app, this would be more sophisticated)
      setValue('name', 'Sample Certificate');
      setValue('certificateNumber', 'CERT-2023-001');
      setValue('issuer', 'Certification Body Inc.');
      setValue('issuedTo', 'Your Company Name');
      setValue('issuedDate', '2023-01-15');
      setValue('expiryDate', '2024-01-14');
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast({
        title: 'OCR Processing Failed',
        description: 'Could not extract text from the document. Please enter the details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingOcr(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: CertificateFormValues) => {
    try {
      // Here you would typically send the data to your API
      console.log('Submitting certificate:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success!',
        description: 'Certificate uploaded successfully',
      });
      
      // Reset form and go to first step
      reset();
      setCurrentStep(1);
      setPreviewUrl(null);
      setOcrResult(null);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
    } catch (error) {
      console.error('Error submitting certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload certificate. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Render step 1: File upload
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Certificate</h3>
        <p className="text-sm text-muted-foreground">
          Upload a scanned copy of your certificate in PDF, JPG, or PNG format.
        </p>
      </div>
      
      <div className="space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          
          {isProcessingOcr ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing document...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center space-y-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue('file', undefined as any, { shouldValidate: true });
                  setPreviewUrl(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove file
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, JPG, PNG (max 10MB)
              </p>
            </div>
          )}
        </div>
        
        {errors.file && (
          <p className="text-sm text-red-500">{errors.file.message}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Need to scan a document?{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setIsCameraOpen(true)}
            >
              Use camera
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Language:</span>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={isProcessingOcr}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {ocrResult?.text && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Extracted Text</h4>
          <div className="p-4 bg-muted/50 rounded-md text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
            {ocrResult.text}
          </div>
        </div>
      )}
    </div>
  );
  
  // Render step 2: Certificate details
  const renderStep2 = () => (
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.certificateNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.certificateNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificateType">Certificate Type *</Label>
            <Select
              onValueChange={(value) => setValue('certificateType', value, { shouldValidate: true })}
              value={certificateType}
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Input
              id="scope"
              placeholder="e.g., Manufacturing of textile products"
              {...register('scope')}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional information about this certificate"
              className="min-h-[100px]"
              {...register('description')}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="autoRenew"
              className="mt-1"
              disabled={isSubmitting}
            />
            <label htmlFor="autoRenew" className="text-sm">
              Set up automatic renewal reminders 30 days before expiry
            </label>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render step 3: Review & Submit
  const renderStep3 = () => (
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
                <p className="font-medium">{name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificate Number</p>
                <p className="font-medium">{certificateNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificate Type</p>
                <p className="font-medium">{certificateType || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issuer</p>
                <p className="font-medium">{issuer || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued To</p>
                <p className="font-medium">{issuedTo || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued Date</p>
                <p className="font-medium">
                  {issuedDate ? format(new Date(issuedDate), 'PPP') : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-medium">
                  {expiryDate ? format(new Date(expiryDate), 'PPP') : 'Not provided'}
                </p>
              </div>
              {scope && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Scope</p>
                  <p className="font-medium">{scope}</p>
                </div>
              )}
              {description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="whitespace-pre-line">{description}</p>
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
              disabled={isSubmitting}
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
            {Math.round((currentStep / wizardSteps.length) * 100)}%
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
                key={step.id}
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
                        stepIdx < currentStep - 1
                          ? 'bg-primary text-white'
                          : stepIdx === currentStep - 1
                          ? 'bg-primary/10 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
                      )}
                    >
                      {stepIdx < currentStep - 1 ? (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <span
                          className={cn(
                            'font-medium text-sm',
                            stepIdx === currentStep - 1 ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {stepIdx + 1}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        stepIdx < currentStep
                          ? 'text-primary'
                          : stepIdx === currentStep - 1
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {step.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {step.description}
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
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < wizardSteps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isProcessingOcr || isSubmitting}
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
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Certificate
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
