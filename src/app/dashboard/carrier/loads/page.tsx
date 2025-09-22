'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Load } from '@/types/load';
import { useAuthStore, fetchWithAuth } from '@/store/auth';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  DollarSign, 
  Package,
  Clock,
  Plus
} from 'lucide-react';

export default function CarrierLoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Fetch available loads
  const fetchLoads = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth('/api/loads?status=posted&sortBy=postedAt&sortOrder=desc');

      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }

      const data = await response.json();
      setLoads(data.loads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoads();
    }
  }, [isAuthenticated, fetchLoads]);

  // Submit an offer
  const handleSubmitOffer = async () => {
    if (!selectedLoad || !offerAmount) {
      return;
    }

    setSubmittingOffer(true);
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await fetchWithAuth(`/api/loads/${selectedLoad._id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(offerAmount),
          message: offerMessage || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit offer');
      }

      // Reset form and close modal
      setSelectedLoad(null);
      setOfferAmount('');
      setOfferMessage('');
      
      // Show success message (you could add a toast notification here)
      alert('Offer submitted successfully!');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available loads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Loads</h1>
        <p className="text-gray-600">Browse and make offers on available loads</p>
      </div>

      {loads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Available Loads</h3>
            <p className="text-gray-600">There are currently no loads available for bidding.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loads.map((load) => (
            <Card key={load._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Load #{load.loadNumber}</CardTitle>
                  <Badge className={getStatusBadgeColor(load.status)}>
                    {load.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-green-600">Pickup</p>
                      <p className="text-sm text-gray-600 truncate">{load.origin.city}, {load.origin.state}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-red-600">Delivery</p>
                      <p className="text-sm text-gray-600 truncate">{load.destination.city}, {load.destination.state}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span>{load.equipmentType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{load.details.weight} lbs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{load.distance} mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>${load.rate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Pickup: {new Date(load.pickupDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Posted: {new Date(load.postedAt).toLocaleDateString()}</span>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => setSelectedLoad(load)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {selectedLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Make an Offer</CardTitle>
              <p className="text-sm text-gray-600">Load #{selectedLoad.loadNumber}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm"><strong>Route:</strong> {selectedLoad.origin.city}, {selectedLoad.origin.state} → {selectedLoad.destination.city}, {selectedLoad.destination.state}</p>
                <p className="text-sm"><strong>Distance:</strong> {selectedLoad.distance} miles</p>
                <p className="text-sm"><strong>Posted Rate:</strong> ${selectedLoad.rate.toLocaleString()}</p>
                <p className="text-sm"><strong>Equipment:</strong> {selectedLoad.equipmentType}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerAmount">Your Offer Amount ($) *</Label>
                <Input
                  id="offerAmount"
                  type="number"
                  step="0.01"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerMessage">Message (Optional)</Label>
                <Textarea
                  id="offerMessage"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add a message to the shipper..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedLoad(null);
                    setOfferAmount('');
                    setOfferMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitOffer}
                  disabled={!offerAmount || submittingOffer}
                >
                  {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}