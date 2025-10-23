'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { 
  FileText, Download, Eye, Search, CheckCircle, XCircle, 
  AlertTriangle, Trash2, Share2, MoreVertical, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface Certificate {
  _id: string;
  certificate_type: string;
  certificate_number: string;
  issued_by: string;
  issued_to?: string;
  issued_date?: string;
  expiry_date: string;
  status: 'valid' | 'expired' | 'expiring_soon' | 'unknown';
  uploaded_at: string;
  ocr_confidence?: number;
}

interface Stats {
  total: number;
  valid: number;
  expiring_soon: number;
  expired: number;
}

export default function CertificatesPage() {
  const searchParams = useSearchParams();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, valid: 0, expiring_soon: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiry_date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCertificates();
  }, [searchQuery, statusFilter, typeFilter, sortBy, page]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        sort: sortBy,
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('certificate_type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiClient.get(`/api/certificates?${params.toString()}`);
      setCertificates(response.data.certificates || []);
      setStats(response.data.stats || { total: 0, valid: 0, expiring_soon: 0, expired: 0 });
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCert = (id: string) => {
    setSelectedCerts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCerts.length === certificates.length) {
      setSelectedCerts([]);
    } else {
      setSelectedCerts(certificates.map((c) => c._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedCerts.length} certificate(s)?`)) return;
    
    try {
      await Promise.all(selectedCerts.map((id) => apiClient.delete(`/api/certificates/${id}`)));
      setSelectedCerts([]);
      fetchCertificates();
    } catch (error) {
      console.error('Failed to delete certificates:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'expiring_soon':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-green-400 font-medium">Certificate uploaded successfully!</p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your compliance certificates and track their status
            </p>
          </div>
          <Link href="/dashboard/certificates/upload">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload Certificate
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Total Certificates</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Valid</p>
            <p className="text-2xl font-bold text-green-500">{stats.valid}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.expiring_soon}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Expired</p>
            <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search certificates..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-ring focus:border-ring block w-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="valid">Valid</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
              <select
                className="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-ring focus:border-ring block w-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="iso">ISO Certificate</option>
                <option value="tax">Tax Certificate</option>
                <option value="business">Business License</option>
                <option value="other">Other</option>
              </select>
              <select
                className="bg-background border border-input text-foreground text-sm rounded-lg focus:ring-ring focus:border-ring block p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="expiry_date">Sort by Expiry</option>
                <option value="-expiry_date">Expiry (Newest)</option>
                <option value="uploaded_at">Upload Date (Oldest)</option>
                <option value="-uploaded_at">Upload Date (Newest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCerts.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-foreground">{selectedCerts.length} certificate(s) selected</span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button 
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition"
                onClick={() => setSelectedCerts([])}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Certificates List */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading certificates...</p>
            </div>
          ) : certificates.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {/* Header Row */}
                <div className="hidden md:flex p-4 bg-muted/50 items-center gap-4 text-sm text-muted-foreground font-medium">
                  <div className="w-8">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary rounded border-input bg-background focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                      checked={selectedCerts.length === certificates.length && certificates.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCerts(certificates.map(c => c._id));
                        } else {
                          setSelectedCerts([]);
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">Certificate</div>
                  <div className="w-40">Issued By</div>
                  <div className="w-28">Issued Date</div>
                  <div className="w-28">Expiry Date</div>
                  <div className="w-32">Status</div>
                  <div className="w-24 text-right">Actions</div>
                </div>

                {/* Certificate Rows */}
                {certificates.map((cert) => (
                  <div key={cert._id} className="group p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-6">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary rounded border-input bg-background focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                          checked={selectedCerts.includes(cert._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCerts([...selectedCerts, cert._id]);
                            } else {
                              setSelectedCerts(selectedCerts.filter(id => id !== cert._id));
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{cert.certificate_type}</div>
                        <div className="text-sm text-muted-foreground">{cert.certificate_number}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 w-full sm:w-auto">
                      <div className="sm:w-40">
                        <div className="text-xs text-muted-foreground sm:hidden">Issued By</div>
                        <div className="text-sm text-foreground">{cert.issued_by}</div>
                      </div>
                      <div className="sm:w-28">
                        <div className="text-xs text-muted-foreground sm:hidden">Issued Date</div>
                        <div className="text-sm text-foreground">{formatDate(cert.issued_date)}</div>
                      </div>
                      <div className="sm:w-28">
                        <div className="text-xs text-muted-foreground sm:hidden">Expiry Date</div>
                        <div className="text-sm font-medium text-foreground">{formatDate(cert.expiry_date)}</div>
                        {cert.expiry_date && (
                          <div className="text-xs text-muted-foreground">
                            {calculateDaysUntilExpiry(cert.expiry_date)} days left
                          </div>
                        )}
                      </div>
                      <div className="sm:w-32">
                        <div className="text-xs text-muted-foreground sm:hidden">Status</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cert.status)}`}>
                          {cert.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="sm:w-24 flex justify-end sm:justify-start gap-2">
                        <Link 
                          href={`/dashboard/certificates/${cert._id}`} 
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 10, stats.total)}</span> of{' '}
                  <span className="font-medium">{stats.total}</span> certificates
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="mx-auto h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No certificates found'
                  : 'No certificates yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by uploading your first certificate'}
              </p>
              <Link href="/dashboard/certificates/upload">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 mx-auto">
                  <FileText className="h-4 w-4" />
                  Upload Certificate
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
