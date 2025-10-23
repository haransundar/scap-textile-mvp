'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, MoreVertical, FileText, BarChart, Network, Shield, Users, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import axios from 'axios';

interface Brand {
  _id: string;
  brand_id: string;
  brand_name: string;
  brand_logo?: string;
  brand_location?: string;
  status: 'connected' | 'pending';
  sharedItemsCount: number;
  sharing_permissions: {
    certificates: boolean;
    risk_score: boolean;
    network: boolean;
    audits: boolean;
  };
  connected_at?: string;
}

interface SharingHistoryItem {
  _id: string;
  brand_name: string;
  data_type: string;
  action: string;
  date: string;
}

export default function BrandsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'connected' | 'pending' | 'history'>('connected');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sharingHistory, setSharingHistory] = useState<SharingHistoryItem[]>([]);
  const [stats, setStats] = useState({ connected: 0, pending: 0, shared: 0 });
  const [loading, setLoading] = useState(true);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [sharingPermissions, setSharingPermissions] = useState({
    certificates: false,
    risk_score: false,
    network: false,
    audits: false,
  });

  useEffect(() => {
    fetchBrands();
    if (activeTab === 'history') {
      fetchSharingHistory();
    }
  }, [activeTab]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/connections`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBrands(activeTab === 'connected' ? response.data.connected : response.data.pending);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharingHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/sharing-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharingHistory(response.data.history);
    } catch (error) {
      console.error('Failed to fetch sharing history:', error);
    }
  };

  const openSharingModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setSharingPermissions(brand.sharing_permissions);
    setShowSharingModal(true);
  };

  const toggleSharing = (key: keyof typeof sharingPermissions) => {
    setSharingPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSharingPermissions = async () => {
    if (!selectedBrand) return;
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${selectedBrand.brand_id}/sharing`,
        sharingPermissions,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSharingModal(false);
      fetchBrands();
    } catch (error) {
      console.error('Failed to update sharing permissions:', error);
    }
  };

  const disconnectBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to disconnect this brand?')) return;
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/disconnect`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrands();
    } catch (error) {
      console.error('Failed to disconnect brand:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Brand Connections</h1>
            <p className="text-muted-foreground mt-1">Manage your brand partnerships and data sharing</p>
          </div>
          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition">
            <Plus className="w-4 h-4 inline mr-2" />
            Connect Brand
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Connected Brands</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.connected}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Pending Requests</p>
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">Data Shared</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.shared} items</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('connected')}
            className={`pb-2 px-4 transition ${
              activeTab === 'connected'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Connected ({stats.connected})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-2 px-4 transition ${
              activeTab === 'pending'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 transition ${
              activeTab === 'history'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sharing History
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading brands...</p>
          </div>
        ) : activeTab === 'history' ? (
          <div className="bg-card rounded-lg p-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sharing Activity</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground text-sm">Date</th>
                  <th className="text-left py-2 text-muted-foreground text-sm">Brand</th>
                  <th className="text-left py-2 text-muted-foreground text-sm">Data Type</th>
                  <th className="text-left py-2 text-muted-foreground text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {sharingHistory.map((item) => (
                  <tr key={item._id} className="border-b border-border">
                    <td className="py-3 text-muted-foreground text-sm">{item.date}</td>
                    <td className="py-3 text-foreground text-sm">{item.brand_name}</td>
                    <td className="py-3 text-muted-foreground text-sm">{item.data_type}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          item.action === 'shared'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : item.action === 'revoked'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div key={brand._id} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {brand.brand_logo ? (
                        <img
                          src={brand.brand_logo}
                          alt={brand.brand_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{brand.brand_name}</h3>
                      <p className="text-xs text-muted-foreground">{brand.brand_location || 'Location N/A'}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      brand.status === 'connected'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {brand.status}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Shared:</span>
                    <span className="text-foreground">{brand.sharedItemsCount} items</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Access Level:</span>
                    <span className="text-primary">Standard</span>
                  </div>
                  {brand.connected_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Connected Since:</span>
                      <span className="text-foreground">{brand.connected_at}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openSharingModal(brand)}
                    className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition"
                  >
                    Manage Access
                  </button>
                  <button
                    onClick={() => disconnectBrand(brand.brand_id)}
                    className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sharing Modal */}
        {showSharingModal && selectedBrand && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Manage Data Sharing - {selectedBrand.brand_name}
                </h2>
                <button
                  onClick={() => setShowSharingModal(false)}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-foreground font-medium">Certificates</p>
                      <p className="text-muted-foreground text-sm">Share your compliance certificates</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingPermissions.certificates}
                    onChange={() => toggleSharing('certificates')}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <div>
                      <p className="text-foreground font-medium">Risk Score</p>
                      <p className="text-muted-foreground text-sm">Share your compliance risk analysis</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingPermissions.risk_score}
                    onChange={() => toggleSharing('risk_score')}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    <div>
                      <p className="text-foreground font-medium">Supply Network</p>
                      <p className="text-muted-foreground text-sm">Share your supplier connections</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingPermissions.network}
                    onChange={() => toggleSharing('network')}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                    <div>
                      <p className="text-foreground font-medium">Audit Reports</p>
                      <p className="text-muted-foreground text-sm">Share audit documents</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharingPermissions.audits}
                    onChange={() => toggleSharing('audits')}
                    className="w-5 h-5"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveSharingPermissions}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSharingModal(false)}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
