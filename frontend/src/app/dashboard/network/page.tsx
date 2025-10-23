'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  Search, 
  Filter, 
  Download,
  AlertTriangle,
  CheckCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  Users,
  Layers,
  Eye,
  Share2
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  tier: number;
  location: string;
  riskScore: number;
  certifications: string[];
  contact: {
    email: string;
    phone: string;
  };
  connectedTo: string[];
  status: 'active' | 'pending' | 'inactive';
  lastAudit: string;
}

interface NetworkNode {
  id: string;
  label: string;
  tier: number;
  risk: number;
  x: number;
  y: number;
  supplier: Supplier;
}

interface NetworkEdge {
  from: string;
  to: string;
}

export default function EnhancedNetworkPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = () => {
    // Mock supplier data
    const mockSuppliers: Supplier[] = [
      {
        id: 'brand',
        name: 'Your Company (Brand)',
        tier: 1,
        location: 'Mumbai, Maharashtra',
        riskScore: 15,
        certifications: ['ISO 9001', 'SA8000'],
        contact: { email: 'contact@yourcompany.com', phone: '+91-22-1234-5678' },
        connectedTo: ['t2-1', 't2-2', 't2-3'],
        status: 'active',
        lastAudit: '2024-09-15'
      },
      {
        id: 't2-1',
        name: 'Tirupur Textiles Ltd',
        tier: 2,
        location: 'Tirupur, Tamil Nadu',
        riskScore: 35,
        certifications: ['GOTS', 'OEKO-TEX', 'ISO 14001'],
        contact: { email: 'info@tirupurtextiles.com', phone: '+91-421-123-4567' },
        connectedTo: ['t3-1', 't3-2'],
        status: 'active',
        lastAudit: '2024-08-20'
      },
      {
        id: 't2-2',
        name: 'Ludhiana Fabrics Pvt Ltd',
        tier: 2,
        location: 'Ludhiana, Punjab',
        riskScore: 52,
        certifications: ['ISO 9001', 'WRAP'],
        contact: { email: 'contact@ludhianafabrics.in', phone: '+91-161-234-5678' },
        connectedTo: ['t3-3', 't3-4'],
        status: 'active',
        lastAudit: '2024-07-10'
      },
      {
        id: 't2-3',
        name: 'Surat Dyeing Works',
        tier: 2,
        location: 'Surat, Gujarat',
        riskScore: 68,
        certifications: ['ZDHC', 'ISO 14001'],
        contact: { email: 'info@suratdyeing.com', phone: '+91-261-345-6789' },
        connectedTo: ['t3-5'],
        status: 'pending',
        lastAudit: '2024-06-05'
      },
      {
        id: 't3-1',
        name: 'Tamil Spinning Mills',
        tier: 3,
        location: 'Coimbatore, Tamil Nadu',
        riskScore: 45,
        certifications: ['BCI', 'ISO 9001'],
        contact: { email: 'sales@tamilspinning.com', phone: '+91-422-456-7890' },
        connectedTo: ['t4-1'],
        status: 'active',
        lastAudit: '2024-05-15'
      },
      {
        id: 't3-2',
        name: 'Erode Weaving Co',
        tier: 3,
        location: 'Erode, Tamil Nadu',
        riskScore: 58,
        certifications: ['ISO 9001'],
        contact: { email: 'info@erodeweaving.in', phone: '+91-424-567-8901' },
        connectedTo: [],
        status: 'active',
        lastAudit: '2024-04-20'
      },
      {
        id: 't3-3',
        name: 'Punjab Cotton Traders',
        tier: 3,
        location: 'Bathinda, Punjab',
        riskScore: 72,
        certifications: [],
        contact: { email: 'contact@punjabcotton.com', phone: '+91-164-678-9012' },
        connectedTo: ['t4-2'],
        status: 'inactive',
        lastAudit: '2023-12-10'
      },
      {
        id: 't3-4',
        name: 'Jalandhar Knitting Mills',
        tier: 3,
        location: 'Jalandhar, Punjab',
        riskScore: 41,
        certifications: ['GOTS', 'OEKO-TEX'],
        contact: { email: 'info@jalandharknitting.in', phone: '+91-181-789-0123' },
        connectedTo: [],
        status: 'active',
        lastAudit: '2024-03-25'
      },
      {
        id: 't3-5',
        name: 'Gujarat Chemical Supplies',
        tier: 3,
        location: 'Ahmedabad, Gujarat',
        riskScore: 85,
        certifications: ['ISO 14001'],
        contact: { email: 'sales@gujaratchemical.com', phone: '+91-79-890-1234' },
        connectedTo: [],
        status: 'pending',
        lastAudit: '2024-02-10'
      },
      {
        id: 't4-1',
        name: 'Karnataka Cotton Farms',
        tier: 4,
        location: 'Hubli, Karnataka',
        riskScore: 38,
        certifications: ['BCI', 'Organic'],
        contact: { email: 'info@karnatakacotton.com', phone: '+91-836-901-2345' },
        connectedTo: [],
        status: 'active',
        lastAudit: '2024-01-15'
      },
      {
        id: 't4-2',
        name: 'Haryana Raw Materials',
        tier: 4,
        location: 'Panipat, Haryana',
        riskScore: 65,
        certifications: [],
        contact: { email: 'contact@haryanaraw.in', phone: '+91-180-012-3456' },
        connectedTo: [],
        status: 'active',
        lastAudit: '2023-11-20'
      }
    ];

    setSuppliers(mockSuppliers);
  };

  // Generate network graph nodes and edges
  const { nodes, edges } = useMemo(() => {
    const filteredSuppliers = suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === 'all' || s.tier.toString() === filterTier;
      const matchesRisk = filterRisk === 'all' || 
        (filterRisk === 'low' && s.riskScore < 40) ||
        (filterRisk === 'medium' && s.riskScore >= 40 && s.riskScore < 70) ||
        (filterRisk === 'high' && s.riskScore >= 70);
      return matchesSearch && matchesTier && matchesRisk;
    });

    // Position nodes in tiers
    const nodesByTier: { [key: number]: Supplier[] } = {};
    filteredSuppliers.forEach(s => {
      if (!nodesByTier[s.tier]) nodesByTier[s.tier] = [];
      nodesByTier[s.tier].push(s);
    });

    const networkNodes: NetworkNode[] = [];
    const tierYPositions = { 1: 80, 2: 200, 3: 320, 4: 440 };
    
    Object.entries(nodesByTier).forEach(([tier, tierSuppliers]) => {
      const tierNum = parseInt(tier);
      const spacing = 600 / (tierSuppliers.length + 1);
      
      tierSuppliers.forEach((supplier, idx) => {
        networkNodes.push({
          id: supplier.id,
          label: supplier.name,
          tier: tierNum,
          risk: supplier.riskScore,
          x: spacing * (idx + 1),
          y: tierYPositions[tierNum as keyof typeof tierYPositions] || 200,
          supplier
        });
      });
    });

    // Generate edges
    const networkEdges: NetworkEdge[] = [];
    filteredSuppliers.forEach(supplier => {
      supplier.connectedTo.forEach(targetId => {
        if (filteredSuppliers.find(s => s.id === targetId)) {
          networkEdges.push({ from: supplier.id, to: targetId });
        }
      });
    });

    return { nodes: networkNodes, edges: networkEdges };
  }, [suppliers, searchQuery, filterTier, filterRisk]);

  const getRiskColor = (risk: number) => {
    if (risk < 40) return '#16a34a'; // green
    if (risk < 70) return '#f59e0b'; // amber
    return '#dc2626'; // red
  };

  const getRiskBadge = (risk: number) => {
    if (risk < 40) return <Badge className="bg-green-900 text-green-300">Low Risk</Badge>;
    if (risk < 70) return <Badge className="bg-yellow-900 text-yellow-300">Medium Risk</Badge>;
    return <Badge className="bg-red-900 text-red-300">High Risk</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-900 text-green-300">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-900 text-yellow-300">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-700 text-gray-300">Inactive</Badge>;
      default:
        return null;
    }
  };

  const networkStats = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const tier2 = suppliers.filter(s => s.tier === 2).length;
    const tier3 = suppliers.filter(s => s.tier === 3).length;
    const tier4 = suppliers.filter(s => s.tier === 4).length;
    const highRisk = suppliers.filter(s => s.riskScore >= 70).length;
    const avgRisk = suppliers.reduce((sum, s) => sum + s.riskScore, 0) / totalSuppliers;

    return { totalSuppliers, tier2, tier3, tier4, highRisk, avgRisk: Math.round(avgRisk) };
  }, [suppliers]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Supply Chain Network</h1>
            <p className="text-muted-foreground mt-1">
            Visualize and manage your multi-tier supplier network
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'graph' ? 'default' : 'outline'}
            onClick={() => setViewMode('graph')}
          >
            <Network className="w-4 h-4 mr-2" />
            Graph View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <Layers className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Suppliers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{networkStats.totalSuppliers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-muted-foreground text-sm">Tier 2</p>
              <p className="text-2xl font-bold text-foreground mt-1">{networkStats.tier2}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-muted-foreground text-sm">Tier 3</p>
              <p className="text-2xl font-bold text-foreground mt-1">{networkStats.tier3}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-muted-foreground text-sm">Tier 4</p>
              <p className="text-2xl font-bold text-foreground mt-1">{networkStats.tier4}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">High Risk</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{networkStats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=""
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-card border border-border rounded px-3 py-2"
            >
              <option value="all">All Tiers</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-card border border-border rounded px-3 py-2"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk (&lt;40)</option>
              <option value="medium">Medium Risk (40-69)</option>
              <option value="high">High Risk (≥70)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Graph */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Network Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <svg
                viewBox="0 0 600 500"
                className="w-full h-[500px] bg-card border border-border rounded-lg"
              >
                {/* Edges */}
                {edges.map((edge, idx) => {
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={idx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#475569"
                      strokeWidth={2}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                  <g
                    key={node.id}
                    onClick={() => setSelectedSupplier(node.supplier)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={25}
                      fill={getRiskColor(node.risk)}
                      opacity={0.9}
                      stroke={selectedSupplier?.id === node.id ? '#3b82f6' : 'none'}
                      strokeWidth={3}
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="fill-white text-xs font-semibold pointer-events-none"
                    >
                      T{node.tier}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-600"></span>
                  Low Risk
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-600"></span>
                  Medium Risk
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-600"></span>
                  High Risk
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedSupplier ? 'Supplier Details' : 'Select a Supplier'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSupplier ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{selectedSupplier.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {getRiskBadge(selectedSupplier.riskScore)}
                      {getStatusBadge(selectedSupplier.status)}
                      <Badge className="bg-blue-900 text-blue-300">
                        Tier {selectedSupplier.tier}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm text-foreground">{selectedSupplier.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground">{selectedSupplier.contact.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm text-foreground">{selectedSupplier.contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <p className="text-sm text-foreground">{selectedSupplier.riskScore}/100</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Audit</p>
                        <p className="text-sm text-foreground">{selectedSupplier.lastAudit}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.certifications.length > 0 ? (
                        selectedSupplier.certifications.map((cert, idx) => (
                          <Badge key={idx} className="bg-secondary text-secondary-foreground">
                            {cert}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No certifications</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Profile
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with Brand
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Click on a node in the network graph to view supplier details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Supplier List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suppliers
                .filter(s => {
                  const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesTier = filterTier === 'all' || s.tier.toString() === filterTier;
                  const matchesRisk = filterRisk === 'all' || 
                    (filterRisk === 'low' && s.riskScore < 40) ||
                    (filterRisk === 'medium' && s.riskScore >= 40 && s.riskScore < 70) ||
                    (filterRisk === 'high' && s.riskScore >= 70);
                  return matchesSearch && matchesTier && matchesRisk;
                })
                .map((supplier) => (
                  <div
                    key={supplier.id}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedSupplier(supplier)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                          <Badge className="bg-blue-900 text-blue-300">
                            Tier {supplier.tier}
                          </Badge>
                          {getRiskBadge(supplier.riskScore)}
                          {getStatusBadge(supplier.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {supplier.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {supplier.certifications.length} certs
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Risk: {supplier.riskScore}
                          </span>
                        </div>
                      </div>
                      
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
