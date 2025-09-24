'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

interface LocationInfo { city?: string; address?: string }
interface AdminLoad {
  _id: string;
  origin: LocationInfo;
  destination: LocationInfo;
  status: string;
  rate: number;
  pickupDate: string;
  deliveryDate: string;
  shipperId?: { firstName: string; lastName: string; company?: string };
}

export default function AdminLoadsPage() {
  const { user, getDashboardRoute } = useAuthStore();
  const [loads, setLoads] = useState<AdminLoad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') window.location.href = getDashboardRoute();
  }, [user, getDashboardRoute]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/loads?limit=100');
      const data = await res.json();
      if (data.success) setLoads(data.loads);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const deleteLoad = async (id: string) => {
    if (!confirm('Delete this load?')) return;
    await fetchWithAuth(`/api/admin/loads/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (!user || user.role !== 'admin') return <div className="p-8">Authorizing...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">All Loads</h1>
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Origin</th>
                  <th className="py-2 pr-4">Destination</th>
                  <th className="py-2 pr-4">Pickup</th>
                  <th className="py-2 pr-4">Delivery</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Loading...</td></tr>}
                {!loading && loads.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No loads</td></tr>}
                {loads.map(l => (
                  <tr key={l._id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{l.origin?.city || l.origin?.address}</td>
                    <td className="py-2 pr-4">{l.destination?.city || l.destination?.address}</td>
                    <td className="py-2 pr-4">{new Date(l.pickupDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{new Date(l.deliveryDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 capitalize">{l.status}</td>
                    <td className="py-2 pr-4">${l.rate}</td>
                    <td className="py-2 pr-4 text-right">
                      <Button size="sm" variant="destructive" onClick={() => deleteLoad(l._id)}>Delete</Button>
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
