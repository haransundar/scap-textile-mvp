'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Download, FileText, CheckCircle, AlertTriangle, Clock, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Mock data - in a real app, this would come from your API
const mockCertificate = {
  id: '1',
  certificateType: 'ISO 9001',
  certificateNumber: 'ISO-9001-2023-12345',
  issuedTo: 'Textile Manufacturing Co.',
  issuedBy: 'International Organization for Standardization',
  issuedDate: '2023-06-15',
  expiryDate: '2026-06-14',
  status: 'valid',
  verified: true,
  needsReview: false,
  filePath: '/certificates/iso9001-12345.pdf',
  scope: 'Design, development, and manufacturing of textile products',
  ocrText: 'CERTIFICATE OF REGISTRATION\nISO 9001:2015\n\nThis is to certify that\nTEXTILE MANUFACTURING CO.\n\nHas been assessed and registered to\nISO 9001:2015 - Quality Management Systems\n\nCertificate Number: ISO-9001-2023-12345\nIssue Date: June 15, 2023\nExpiry Date: June 14, 2026\n\nScope: Design, development, and manufacturing of textile products',
  ocrConfidence: 0.97,
  notes: 'This certificate was automatically processed by our AI system with high confidence.',
  createdBy: 'John Doe',
  createdAt: '2023-06-16T10:30:00Z',
  updatedAt: '2023-06-16T10:30:00Z',
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap = {
    valid: { label: 'Valid', variant: 'default' as const, icon: CheckCircle },
    expiring_soon: { label: 'Expiring Soon', variant: 'warning' as const, icon: AlertTriangle },
    expired: { label: 'Expired', variant: 'destructive' as const, icon: Clock },
    unknown: { label: 'Unknown', variant: 'outline' as const },
  };

  const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.unknown;
  const Icon = statusInfo.icon;

  return (
    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {statusInfo.label}
    </Badge>
  );
};

// Confidence indicator component
const ConfidenceIndicator = ({ confidence }: { confidence: number }) => {
  const getColor = (value: number) => {
    if (value >= 0.9) return 'bg-green-500';
    if (value >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = (value: number) => {
    if (value >= 0.9) return 'High';
    if (value >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(confidence)}`} 
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium">
        {getLabel(confidence)} ({(confidence * 100).toFixed(0)}%)
      </span>
    </div>
  );
};

export function CertificateDetail() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  // In a real app, you would fetch this data from your API
  const { data: certificate, isLoading } = {
    data: mockCertificate,
    isLoading: false,
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format date time for display
  const formatDateTime = (dateTimeString: string) => {
    try {
      return format(new Date(dateTimeString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle download
  const handleDownload = () => {
    // In a real app, this would trigger a file download
    toast({
      title: 'Download started',
      description: 'Your certificate is being downloaded.',
    });
  };

  // Handle delete
  const handleDelete = () => {
    // In a real app, this would show a confirmation dialog
    // and then call the API to delete the certificate
    toast({
      title: 'Delete certificate',
      description: 'Are you sure you want to delete this certificate?',
      action: (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>Cancel</Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              // Handle delete
              toast({
                title: 'Certificate deleted',
                description: 'The certificate has been deleted successfully.',
              });
              router.push('/dashboard/certificates');
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48 md:col-span-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Certificate not found</h2>
        <p className="text-muted-foreground mb-6">
          The certificate you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push('/dashboard/certificates')}>
          Back to Certificates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {certificate.certificateType} Certificate
            </h1>
            <p className="text-muted-foreground">
              {certificate.certificateNumber}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Certificate Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Certificate Details</CardTitle>
              <StatusBadge status={certificate.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Certificate Type</p>
                <p className="font-medium">{certificate.certificateType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Certificate Number</p>
                <p className="font-mono text-sm">{certificate.certificateNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <div>
                  <StatusBadge status={certificate.status} />
                </div>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Issued To</p>
                <p className="font-medium">{certificate.issuedTo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Issued By</p>
                <p>{certificate.issuedBy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scope</p>
                <p>{certificate.scope}</p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p>{formatDate(certificate.issuedDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p>{formatDate(certificate.expiryDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p>
                  {Math.ceil(
                    (new Date(certificate.expiryDate).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )} days
                </p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created By</p>
                <p>{certificate.createdBy}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{formatDateTime(certificate.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p>{formatDateTime(certificate.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* OCR Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>AI Confidence:</span>
              <ConfidenceIndicator confidence={certificate.ocrConfidence} />
              {certificate.needsReview && (
                <Badge variant="warning" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Review
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative group">
              <div className="relative p-4 bg-muted/50 rounded-md overflow-hidden">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {certificate.ocrText}
                </pre>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(certificate.ocrText);
                  toast({
                    title: 'Copied to clipboard',
                    description: 'The extracted text has been copied to your clipboard.',
                  });
                }}>
                  Copy Text
                </Button>
              </div>
            </div>
            
            {certificate.notes && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm">{certificate.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
