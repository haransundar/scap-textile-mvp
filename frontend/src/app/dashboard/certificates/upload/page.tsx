'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Disable SSR for the upload wizard since it uses browser APIs
const UploadCertificateWizard = dynamic(
  () => import('./UploadWizard'),
  { 
    loading: () => (
      <div className="space-y-8 p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-4">
          <div className="h-2.5 w-full bg-muted rounded-full">
            <div className="h-full bg-primary/10 rounded-full w-1/3"></div>
          </div>
          <div className="rounded-lg border p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full max-w-xs" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
);

/**
 * Page component for uploading certificates
 * Uses a dynamic import for the UploadCertificateWizard component
 * to enable client-side only rendering (required for file uploads and camera access)
 */
export default function UploadCertificatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Certificate</h1>
          <p className="text-muted-foreground mt-2">
            Upload and verify your compliance certificates for supply chain transparency
          </p>
        </div>
        
        <UploadCertificateWizard />
      </div>
    </div>
  );
}
