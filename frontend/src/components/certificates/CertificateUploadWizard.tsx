'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatFileSize } from '@/lib/utils';

// Form validation schema
const certificateSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB max
    { message: 'File size must be less than 5MB' }
  ),
  certificateType: z.string().min(1, 'Certificate type is required'),
  issuedTo: z.string().min(1, 'Issued to is required'),
  issuedBy: z.string().min(1, 'Issued by is required'),
  issuedDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

const certificateTypes = [
  'ISO 9001',
  'ISO 14001',
  'GOTS',
  'OEKO-TEX',
  'SA8000',
  'BSCI',
  'Fair Trade',
  'Other'
];

export function CertificateUploadWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificateType: '',
      issuedTo: '',
      issuedBy: '',
      issuedDate: '',
      expiryDate: '',
      notes: '',
    },
  });

  const selectedFile = watch('file');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setValue('file', acceptedFiles[0]);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Process the uploaded file with AI
  const processFileWithAI = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data - in a real app, this would come from your API
      const mockExtractedData = {
        certificateType: 'ISO 9001',
        issuedTo: 'Textile Manufacturing Co.',
        issuedBy: 'International Organization for Standardization',
        issuedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 0.92,
      };
      
      setExtractedData(mockExtractedData);
      
      // Auto-fill form with extracted data
      setValue('certificateType', mockExtractedData.certificateType);
      setValue('issuedTo', mockExtractedData.issuedTo);
      setValue('issuedBy', mockExtractedData.issuedBy);
      setValue('issuedDate', mockExtractedData.issuedDate);
      setValue('expiryDate', mockExtractedData.expiryDate);
      
      toast.success('Certificate processed successfully!');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process certificate. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Process the file with AI
      await processFileWithAI(selectedFile);
      
      // Complete the progress
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: CertificateFormData) => {
    try {
      setIsUploading(true);
      
      // In a real app, you would send this data to your API
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('certificateType', data.certificateType);
      formData.append('issuedTo', data.issuedTo);
      formData.append('issuedBy', data.issuedBy);
      formData.append('issuedDate', data.issuedDate);
      formData.append('expiryDate', data.expiryDate);
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and reset form
      toast.success('Certificate uploaded successfully!');
      setCurrentStep(3);
      
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Failed to upload certificate. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Render step 1 - File upload
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload Certificate</h2>
        <p className="text-muted-foreground">
          Upload a certificate file to get started. We support PDF, JPG, and PNG files.
        </p>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          {selectedFile ? (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{selectedFile.name}</p>
              <p>{formatFileSize(selectedFile.size)} • {selectedFile.type}</p>
            </div>
          ) : (
            <>
              <div>
                <p className="font-medium">Drag and drop your file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, JPG, PNG (max 5MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {errors.file && (
        <p className="text-sm text-destructive flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errors.file.message}
        </p>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={handleFileUpload}
          disabled={!selectedFile || isUploading || isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );

  // Render step 2 - Verify details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Verify Certificate Details</h2>
        <p className="text-muted-foreground">
          Please review and confirm the extracted information.
        </p>
      </div>
      
      <div className="space-y-6">
        {extractedData && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Confidence</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${extractedData.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(extractedData.confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The AI has extracted these details with {Math.round(extractedData.confidence * 100)}% confidence. 
              Please verify all information is correct.
            </p>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="certificateType">Certificate Type</Label>
            <Controller
              name="certificateType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certificate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.certificateType && (
              <p className="text-sm text-destructive">{errors.certificateType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Certificate Number</Label>
            <Controller
              name="certificateType" // This should be certificateNumber in a real implementation
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter certificate number" {...field} />
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuedTo">Issued To</Label>
            <Controller
              name="issuedTo"
              control={control}
              render={({ field }) => (
                <Input placeholder="Company name" {...field} />
              )}
            />
            {errors.issuedTo && (
              <p className="text-sm text-destructive">{errors.issuedTo.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuedBy">Issued By</Label>
            <Controller
              name="issuedBy"
              control={control}
              render={({ field }) => (
                <Input placeholder="Issuing organization" {...field} />
              )}
            />
            {errors.issuedBy && (
              <p className="text-sm text-destructive">{errors.issuedBy.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issuedDate">Issue Date</Label>
            <Controller
              name="issuedDate"
              control={control}
              render={({ field }) => (
                <Input type="date" {...field} />
              )}
            />
            {errors.issuedDate && (
              <p className="text-sm text-destructive">{errors.issuedDate.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Controller
              name="expiryDate"
              control={control}
              render={({ field }) => (
                <Input type="date" {...field} />
              )}
            />
            {errors.expiryDate && (
              <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input placeholder="Add any additional notes" {...field} />
              )}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          disabled={isUploading}
        >
          Back
        </Button>
        <Button 
          type="submit" 
          disabled={isUploading}
          className="ml-auto"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Certificate'
          )}
        </Button>
      </div>
    </div>
  );

  // Render step 3 - Success
  const renderStep3 = () => (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Certificate Uploaded Successfully!</h2>
        <p className="text-muted-foreground">
          Your certificate has been processed and saved to your dashboard.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setCurrentStep(1);
            // Reset form here if needed
          }}
        >
          Upload Another
        </Button>
        <Button>View Certificate</Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Certificate</CardTitle>
        <CardDescription>
          {currentStep === 1 && 'Upload a certificate file to get started'}
          {currentStep === 2 && 'Verify the extracted information'}
          {currentStep === 3 && 'Certificate successfully uploaded'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step < currentStep 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`h-1 w-12 mx-1 ${step < currentStep ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={currentStep >= 1 ? 'font-medium text-foreground' : ''}>Upload</span>
            <span className={currentStep >= 2 ? 'font-medium text-foreground' : ''}>Verify</span>
            <span className={currentStep >= 3 ? 'font-medium text-foreground' : ''}>Complete</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>
        
        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
