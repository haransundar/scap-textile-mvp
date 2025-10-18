'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ChevronDown, Download, FileText } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'pending';
  expiryDate: string;
  uploadDate: string;
  documentUrl: string;
  type?: string;
  verified?: boolean;
}

interface EnhancedCertificateListProps {
  certificates: Certificate[];
  onDownload: (id: string, name: string) => void;
  onViewDetails: (id: string) => void;
  isLoading?: boolean;
}

export function EnhancedCertificateList({
  certificates,
  onDownload,
  onViewDetails,
  isLoading = false,
}: EnhancedCertificateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Certificate;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Filter certificates based on search term and status
  const filteredCertificates = useMemo(() => {
    return certificates.filter((certificate) => {
      const matchesSearch =
        certificate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        certificate.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        certificate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchTerm, statusFilter]);

  // Sort certificates
  const sortedCertificates = useMemo(() => {
    if (!sortConfig) return filteredCertificates;
    
    return [...filteredCertificates].sort((a, b) => {
      const aValue = a[sortConfig.key] as string | number | Date;
      const bValue = b[sortConfig.key] as string | number | Date;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredCertificates, sortConfig]);

  const requestSort = (key: keyof Certificate) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      valid: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={statusClasses[status as keyof typeof statusClasses]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading certificates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search certificates..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => requestSort('expiryDate')}
              >
                <div className="flex items-center">
                  Expiry Date
                  <ChevronDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCertificates.length > 0 ? (
              sortedCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {certificate.name}
                    </div>
                  </TableCell>
                  <TableCell>{certificate.issuer}</TableCell>
                  <TableCell>
                    {format(new Date(certificate.expiryDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(certificate.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(certificate.id, certificate.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(certificate.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No certificates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
