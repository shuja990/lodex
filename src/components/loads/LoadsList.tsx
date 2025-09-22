'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Load, LoadStatus, LoadSearchFilters } from '@/types/load';
import { formatDistance, formatLocation } from '@/lib/geolocation';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  MoreHorizontal,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { fetchWithAuth } from '@/store/auth';

export interface LoadsListProps {
  onCreateLoad: () => void;
  onEditLoad: (load: Load) => void;
  onViewLoad: (load: Load) => void;
  onDeleteLoad?: (loadId: string) => Promise<void>;
}

const statusColors: Record<LoadStatus, string> = {
  posted: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: Record<LoadStatus, string> = {
  posted: 'Posted',
  assigned: 'Assigned',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export default function LoadsList({
  onCreateLoad,
  onEditLoad,
  onViewLoad,
  onDeleteLoad
}: LoadsListProps) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<LoadSearchFilters['sortBy']>('postedAt');
  const [sortOrder, setSortOrder] = useState<LoadSearchFilters['sortOrder']>('desc');
  
  // Delete confirmation
  const [loadToDelete, setLoadToDelete] = useState<Load | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch loads
  const fetchLoads = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sortBy || 'postedAt',
        sortOrder: sortOrder || 'desc'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetchWithAuth(`/api/loads?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }

      const data = await response.json();
      if (data.success) {
        setLoads(data.loads || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      } else {
        throw new Error(data.message || 'Failed to fetch loads');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, sortBy, sortOrder, statusFilter, searchQuery]);

  // Handle delete
  const handleDelete = async (load: Load) => {
    if (!onDeleteLoad) return;
    
    setIsDeleting(true);
    try {
      await onDeleteLoad(load._id!);
      setLoadToDelete(null);
      await fetchLoads(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete load');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchLoads(1);
  };

  // Handle filter changes
  useEffect(() => {
    fetchLoads(1);
  }, [fetchLoads, statusFilter, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  if (isLoading && loads.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading loads...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Loads</h2>
          <p className="text-gray-600">Manage your shipping loads</p>
        </div>
        <Button onClick={onCreateLoad} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Load</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search loads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LoadStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <SelectItem key={status} value={status}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as LoadSearchFilters['sortBy']);
                setSortOrder(order as LoadSearchFilters['sortOrder']);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postedAt-desc">Newest First</SelectItem>
                  <SelectItem value="postedAt-asc">Oldest First</SelectItem>
                  <SelectItem value="pickupDate-asc">Pickup Date</SelectItem>
                  <SelectItem value="deliveryDate-asc">Delivery Date</SelectItem>
                  <SelectItem value="rate-desc">Highest Rate</SelectItem>
                  <SelectItem value="rate-asc">Lowest Rate</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => fetchLoads(pagination.page)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loads Table */}
      <Card>
        <CardContent>
          {loads.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loads found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first load to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={onCreateLoad}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Load
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pickup Date</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loads.map((load) => (
                    <TableRow key={load._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <p>{load.loadNumber}</p>
                          {load.referenceNumber && (
                            <p className="text-xs text-gray-500">Ref: {load.referenceNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">
                              {formatLocation(load.origin)}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <span className="mr-1">→</span>
                              {formatLocation(load.destination)}
                            </p>
                            {load.distance && (
                              <p className="text-xs text-gray-500">
                                {formatDistance(load.distance)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[load.status]}>
                          {statusLabels[load.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm">
                              {new Date(load.pickupDate).toLocaleDateString()}
                            </p>
                            {load.pickupTime && (
                              <p className="text-xs text-gray-500">{load.pickupTime}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {load.equipmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">
                              ${load.rate.toLocaleString()}
                            </p>
                            {load.ratePerMile && (
                              <p className="text-xs text-gray-500">
                                ${load.ratePerMile.toFixed(2)}/mi
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewLoad(load)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {(load.status === 'posted' || load.status === 'cancelled') && (
                              <DropdownMenuItem onClick={() => onEditLoad(load)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Load
                              </DropdownMenuItem>
                            )}
                            {(load.status === 'posted' || load.status === 'cancelled') && onDeleteLoad && (
                              <DropdownMenuItem 
                                onClick={() => setLoadToDelete(load)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Load
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      {pagination.page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              fetchLoads(pagination.page - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === pagination.page}
                              onClick={(e) => {
                                e.preventDefault();
                                fetchLoads(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {pagination.page < pagination.totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              fetchLoads(pagination.page + 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!loadToDelete} onOpenChange={() => setLoadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Load</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete load {loadToDelete?.loadNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => loadToDelete && handleDelete(loadToDelete)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Load'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}