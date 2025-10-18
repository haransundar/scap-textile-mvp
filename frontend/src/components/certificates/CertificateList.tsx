'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Filter, Download, MoreHorizontal, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Mock data - in a real app, this would come from your API
const mockCertificates = [
  {
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
  },
  {
    id: '2',
    certificateType: 'GOTS',
    certificateNumber: 'GOTS-23-456789',
    issuedTo: 'Organic Textiles Ltd',
    issuedBy: 'Global Organic Textile Standard',
    issuedDate: '2023-03-10',
    expiryDate: '2024-03-09',
    status: 'expiring_soon',
    verified: true,
    needsReview: false,
    filePath: '/certificates/gots-456789.pdf',
  },
  {
    id: '3',
    certificateType: 'OEKO-TEX',
    certificateNumber: 'OEKO-2023-7890',
    issuedTo: 'Eco Fabrics Inc',
    issuedBy: 'OEKO-TEX Association',
    issuedDate: '2022-12-01',
    expiryDate: '2023-11-30',
    status: 'expired',
    verified: true,
    needsReview: true,
    filePath: '/certificates/oeko-tex-7890.pdf',
  },
];

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

// Certificate type filter options
const certificateTypes = [
  'All Types',
  'ISO 9001',
  'ISO 14001',
  'GOTS',
  'OEKO-TEX',
  'SA8000',
  'BSCI',
  'Fair Trade',
];

export function CertificateList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // In a real app, you would fetch this data from your API
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCertificates;
    },
  });

  // Filter certificates based on search and filters
  const filteredCertificates = certificates.filter((cert: any) => {
    const matchesSearch = 
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || cert.certificateType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            Manage and track your compliance certificates
          </p>
        </div>
        <div>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Upload Certificate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search certificates..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCertificates.map((cert: any) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{cert.certificateType}</span>
                          <span className="text-xs text-muted-foreground">{cert.certificateNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cert.issuedTo}</TableCell>
                      <TableCell>{cert.issuedBy}</TableCell>
                      <TableCell>{formatDate(cert.issuedDate)}</TableCell>
                      <TableCell>{formatDate(cert.expiryDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={cert.status} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredCertificates.length > 0 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredCertificates.length)}
                </span>{' '}
                of <span className="font-medium">{filteredCertificates.length}</span> certificates
              </div>
              <Pagination className="m-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
