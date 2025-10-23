'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Scale, 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Filter,
  Search,
  ExternalLink,
  Clock,
  Globe,
  FileText,
  ChevronRight,
  Download
} from 'lucide-react';

interface Regulation {
  id: string;
  title: string;
  jurisdiction: string;
  effectiveDate: string;
  impact: 'high' | 'medium' | 'low';
  aiSummary: string;
  affectedCertificates: number;
  daysUntilEffective: number;
  category: string;
}

interface Chemical {
  id: string;
  name: string;
  cas: string;
  bannedIn: string[];
  restrictedIn: string[];
  regulations: string[];
  alternatives?: string[];
}

interface ComplianceAlert {
  id: string;
  type: 'certificate_expiry' | 'regulation_update' | 'audit_due';
  title: string;
  description: string;
  deadline: string;
  daysLeft: number;
  affectedCertificates: string[];
  actions: string[];
  reviewed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'expiry' | 'regulation' | 'audit';
  daysLeft: number;
}

export default function EnhancedCompliancePage() {
  const { user } = useAuthStore();
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chemicalResults, setChemicalResults] = useState<Chemical[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    activeRegulations: 12,
    pendingActions: 3,
    upcomingDeadlines: 2,
    complianceScore: 92
  });

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      // Load mock data for demonstration
      setMockData();
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // Mock Regulations
    const mockRegulations: Regulation[] = [
      {
        id: '1',
        title: 'EU Corporate Sustainability Due Diligence Directive (CSDDD)',
        jurisdiction: 'European Union',
        effectiveDate: '2024-12-31',
        impact: 'high',
        aiSummary: 'Requires companies to identify and address adverse human rights and environmental impacts in their supply chains. Applies to large EU companies and non-EU companies with significant EU operations. Mandatory due diligence processes must be implemented.',
        affectedCertificates: 3,
        daysUntilEffective: 45,
        category: 'Supply Chain'
      },
      {
        id: '2',
        title: 'REACH Regulation - New Chemical Restrictions',
        jurisdiction: 'European Union',
        effectiveDate: '2025-03-15',
        impact: 'high',
        aiSummary: 'Updates to REACH Annex XVII restricting 15 new substances in textile products. Includes phthalates, formaldehyde, and certain azo dyes. Maximum concentration limits reduced to 0.1% by weight.',
        affectedCertificates: 5,
        daysUntilEffective: 120,
        category: 'Chemical Safety'
      },
      {
        id: '3',
        title: 'BIS Quality Control Order - Textile Products',
        jurisdiction: 'India',
        effectiveDate: '2024-11-30',
        impact: 'medium',
        aiSummary: 'Bureau of Indian Standards mandates quality certification for imported textiles. Covers fabric quality, colorfastness, and dimensional stability. Registration required before customs clearance.',
        affectedCertificates: 2,
        daysUntilEffective: 15,
        category: 'Quality Standards'
      },
      {
        id: '4',
        title: 'ZDHC MRSL v3.1 Update',
        jurisdiction: 'Global',
        effectiveDate: '2025-01-01',
        impact: 'medium',
        aiSummary: 'Zero Discharge of Hazardous Chemicals updates Manufacturing Restricted Substances List. Adds 23 new substances and lowers limits for existing chemicals. Affects dyeing and finishing processes.',
        affectedCertificates: 4,
        daysUntilEffective: 60,
        category: 'Chemical Safety'
      }
    ];

    // Mock Alerts
    const mockAlerts: ComplianceAlert[] = [
      {
        id: '1',
        type: 'certificate_expiry',
        title: 'GOTS Certificate Expiring Soon',
        description: 'Your Global Organic Textile Standard certificate expires in 28 days',
        deadline: '2024-12-15',
        daysLeft: 28,
        affectedCertificates: ['GOTS-2023-001'],
        actions: ['Schedule renewal audit', 'Update documentation', 'Submit renewal application'],
        reviewed: false
      },
      {
        id: '2',
        type: 'regulation_update',
        title: 'New REACH Restrictions Affecting Your Products',
        description: 'EU REACH regulation updates affect 3 of your certified products',
        deadline: '2025-03-15',
        daysLeft: 120,
        affectedCertificates: ['OEKO-001', 'OEKO-002', 'ISO-14001'],
        actions: ['Review chemical inventory', 'Test affected products', 'Update supplier contracts'],
        reviewed: false
      },
      {
        id: '3',
        type: 'audit_due',
        title: 'SA8000 Surveillance Audit Due',
        description: 'Annual surveillance audit for Social Accountability certification',
        deadline: '2024-12-01',
        daysLeft: 14,
        affectedCertificates: ['SA8000-2023'],
        actions: ['Prepare documentation', 'Schedule auditor', 'Conduct internal review'],
        reviewed: true
      }
    ];

    // Mock Calendar Events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'GOTS Certificate Renewal',
        date: '2024-12-15',
        type: 'expiry',
        daysLeft: 28
      },
      {
        id: '2',
        title: 'SA8000 Audit',
        date: '2024-12-01',
        type: 'audit',
        daysLeft: 14
      },
      {
        id: '3',
        title: 'REACH Compliance Deadline',
        date: '2025-03-15',
        type: 'regulation',
        daysLeft: 120
      },
      {
        id: '4',
        title: 'ISO 14001 Renewal',
        date: '2025-01-30',
        type: 'expiry',
        daysLeft: 75
      }
    ];

    setRegulations(mockRegulations);
    setAlerts(mockAlerts);
    setCalendarEvents(mockEvents);
  };

  const searchChemicals = async () => {
    if (!searchQuery.trim()) return;

    // Mock chemical search results
    const mockChemicals: Chemical[] = [
      {
        id: '1',
        name: 'Formaldehyde',
        cas: '50-00-0',
        bannedIn: [],
        restrictedIn: ['EU', 'USA', 'India'],
        regulations: ['REACH', 'OEKO-TEX', 'ZDHC MRSL'],
        alternatives: ['Glyoxal-based resins', 'Polycarboxylic acids']
      },
      {
        id: '2',
        name: 'Nonylphenol Ethoxylates (NPE)',
        cas: '9016-45-9',
        bannedIn: ['EU'],
        restrictedIn: ['USA', 'Canada'],
        regulations: ['REACH Annex XVII', 'ZDHC MRSL', 'bluesign'],
        alternatives: ['Alcohol ethoxylates', 'Fatty acid ethoxylates']
      }
    ];

    setChemicalResults(mockChemicals);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-900 text-red-300';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300';
      case 'low':
        return 'bg-green-900 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'bg-red-900 text-red-300';
    if (daysLeft <= 30) return 'bg-yellow-900 text-yellow-300';
    return 'bg-green-900 text-green-300';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compliance Monitoring</h1>
            <p className="text-muted-foreground mt-1">
              Stay ahead with real-time regulatory updates
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Subscribe to Alerts
          </Button>
        </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Regulations</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.activeRegulations}</p>
              </div>
              <Scale className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Actions</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pendingActions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.upcomingDeadlines}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Compliance Score</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.complianceScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-card border border-border rounded-lg p-4 ${alert.reviewed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <Badge className={getDeadlineColor(alert.daysLeft)}>
                      {alert.daysLeft} days left
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3">{alert.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold">Required Actions:</p>
                    {alert.actions.map((action, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm text-foreground">
                        <input type="checkbox" className="rounded" />
                        {action}
                      </label>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    Affects: {alert.affectedCertificates.join(', ')}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    const updated = alerts.map(a =>
                      a.id === alert.id ? { ...a, reviewed: !a.reviewed } : a
                    );
                    setAlerts(updated);
                  }}
                >
                  {alert.reviewed ? 'Unmark' : 'Mark as Reviewed'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Regulatory Updates Feed */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Latest Regulatory Updates</CardTitle>
            <div className="flex gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-card border border-border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Regions</option>
                <option value="eu">European Union</option>
                <option value="india">India</option>
                <option value="global">Global</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {regulations.map((reg) => (
            <div
              key={reg.id}
              className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-blue-900 text-blue-300">
                      <Globe className="w-3 h-3 mr-1" />
                      {reg.jurisdiction}
                    </Badge>
                    <Badge className={getImpactColor(reg.impact)}>
                      {reg.impact} Impact
                    </Badge>
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Effective: {reg.effectiveDate}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {reg.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-3">
                    {reg.aiSummary}
                  </p>
                  
                  {reg.affectedCertificates > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">
                        {reg.affectedCertificates} of your certificates affected
                      </span>
                    </div>
                  )}
                </div>
                
                <Button className="ml-4 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chemical Compliance Checker */}
      <Card>
        <CardHeader>
          <CardTitle>Check Chemical Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter chemical name or CAS number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchChemicals()}
              className="flex-1"
            />
            <Button onClick={searchChemicals} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {chemicalResults.length > 0 && (
            <div className="space-y-3">
              {chemicalResults.map((chemical) => (
                <div key={chemical.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{chemical.name}</h3>
                      <p className="text-muted-foreground text-sm">CAS: {chemical.cas}</p>
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {chemical.bannedIn.map((region) => (
                          <Badge key={region} className="bg-red-900 text-red-300">
                            Banned in {region}
                          </Badge>
                        ))}
                        {chemical.restrictedIn.map((region) => (
                          <Badge key={region} className="bg-yellow-900 text-yellow-300">
                            Restricted in {region}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mt-2">
                        <span className="font-semibold">Regulations:</span> {chemical.regulations.join(', ')}
                      </p>
                      
                      {chemical.alternatives && chemical.alternatives.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground font-semibold mb-1">Safer Alternatives:</p>
                          <p className="text-sm text-green-400">{chemical.alternatives.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm" className="ml-4">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm mb-3">Upcoming Deadlines</h3>
            {calendarEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between bg-card border border-border rounded-lg p-3 hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-foreground text-sm font-medium">{event.title}</p>
                    <p className="text-muted-foreground text-xs">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getDeadlineColor(event.daysLeft)}>
                    {event.daysLeft} days left
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            <Calendar className="w-4 h-4 mr-2" />
            View Full Calendar
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
