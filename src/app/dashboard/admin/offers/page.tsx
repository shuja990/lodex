'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/store/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { 
  HandCoins, 
  MapPin, 
  Truck, 
  Building, 
  Calendar, 
  DollarSign,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface OfferLocation { 
  city?: string; 
  state?: string; 
  address?: string; 
}

interface OfferShipper {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
}

interface OfferLoadInfo { 
  _id: string; 
  origin?: OfferLocation; 
  destination?: OfferLocation; 
  status?: string;
  rate?: number;
  weight?: number;
  description?: string;
  shipperId?: OfferShipper | string; // Can be populated object or just ID
}

interface OfferCarrierInfo { 
  _id: string; 
  firstName: string;
  lastName: string; 
  company?: string;
  email: string;
}

interface AdminOffer {
  _id: string;
  status: string;
  amount: number;
  createdAt: string;
  loadId?: OfferLoadInfo | null;
  carrierId?: OfferCarrierInfo | null;
}

export default function AdminOffersPage() {
  const { user, getDashboardRoute } = useAuthStore();
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') window.location.href = getDashboardRoute();
  }, [user, getDashboardRoute]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetchWithAuth(`/api/admin/offers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let filteredOffers = data.offers;
        
        // Client-side search filtering
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredOffers = filteredOffers.filter((offer: AdminOffer) => {
            const shipper = offer.loadId?.shipperId;
            const shipperMatch = shipper && typeof shipper === 'object' ? (
              shipper.firstName?.toLowerCase().includes(query) ||
              shipper.lastName?.toLowerCase().includes(query) ||
              shipper.company?.toLowerCase().includes(query) ||
              shipper.email?.toLowerCase().includes(query)
            ) : false;
            
            return offer.loadId?.origin?.city?.toLowerCase().includes(query) ||
              offer.loadId?.destination?.city?.toLowerCase().includes(query) ||
              offer.carrierId?.firstName?.toLowerCase().includes(query) ||
              offer.carrierId?.lastName?.toLowerCase().includes(query) ||
              offer.carrierId?.company?.toLowerCase().includes(query) ||
              shipperMatch;
          });
        }
        
        setOffers(filteredOffers);
      }
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadOffers(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = () => {
    loadOffers();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'admin') return <div className="p-8">Authorizing...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <HandCoins className="h-8 w-8 mr-3" />
            Offers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all carrier offers in the system
          </p>
        </div>
        <Button onClick={loadOffers} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by location, carrier, or shipper..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button variant="outline" onClick={handleSearch} disabled={loading}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Offers ({offers.length})</span>
            {!loading && (
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Load Details</th>
                  <th className="text-left py-3 pr-4 font-medium">Carrier</th>
                  <th className="text-left py-3 pr-4 font-medium">Shipper</th>
                  <th className="text-left py-3 pr-4 font-medium">Offer Amount</th>
                  <th className="text-left py-3 pr-4 font-medium">Status</th>
                  <th className="text-left py-3 pr-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading offers...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && offers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No offers found</p>
                      <p className="text-xs">Try adjusting your search filters</p>
                    </td>
                  </tr>
                )}
                {offers.map(offer => (
                  <tr key={offer._id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-4 pr-4">
                      {offer.loadId ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-medium">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {offer.loadId.origin?.city || 'Unknown'}, {offer.loadId.origin?.state || 'Unknown'}
                            <span className="mx-2">→</span>
                            {offer.loadId.destination?.city || 'Unknown'}, {offer.loadId.destination?.state || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {offer.loadId.description && (
                              <div className="truncate max-w-xs">{offer.loadId.description}</div>
                            )}
                            {offer.loadId.weight && (
                              <div>Weight: {offer.loadId.weight} lbs</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Load data unavailable</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {offer.carrierId ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {offer.carrierId.firstName} {offer.carrierId.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              {offer.carrierId.company ? (
                                <>
                                  <Building className="h-3 w-3 mr-1" />
                                  {offer.carrierId.company}
                                </>
                              ) : (
                                offer.carrierId.email
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Carrier unavailable</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {offer.loadId?.shipperId && typeof offer.loadId.shipperId === 'object' ? (
                        <div>
                          <div className="font-medium">
                            {offer.loadId.shipperId.firstName} {offer.loadId.shipperId.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            {offer.loadId.shipperId.company ? (
                              <>
                                <Building className="h-3 w-3 mr-1" />
                                {offer.loadId.shipperId.company}
                              </>
                            ) : (
                              offer.loadId.shipperId.email
                            )}
                          </div>
                        </div>
                      ) : offer.loadId?.shipperId ? (
                        <span className="text-muted-foreground">Shipper ID: {String(offer.loadId.shipperId)}</span>
                      ) : (
                        <span className="text-muted-foreground">Shipper unavailable</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        {offer.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge className={`${getStatusColor(offer.status)} capitalize`}>
                        {offer.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <div>
                          <div>{new Date(offer.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(offer.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
