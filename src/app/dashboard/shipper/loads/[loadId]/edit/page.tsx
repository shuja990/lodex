'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadForm from '@/components/loads/LoadForm';
import { Load, CreateLoadRequest, UpdateLoadRequest } from '@/types/load';
import { fetchWithAuth } from '@/store/auth';

export default function EditLoadPage() {
  const router = useRouter();
  const { loadId } = useParams();
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoad() {
      try {
        const res = await fetchWithAuth(`/api/loads/${loadId}`);
        if (!res.ok) throw new Error('Failed to fetch load');
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch load');
        setLoad(data.load);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch load');
      } finally {
        setLoading(false);
      }
    }
    if (loadId) {
      fetchLoad();
    }
  }, [loadId]);

  const handleUpdate = async (formData: CreateLoadRequest | UpdateLoadRequest) => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`/api/loads/${loadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update load');
      }
      const result = await response.json();
      if (result.success) {
        router.push('/dashboard/shipper/loads');
      } else {
        throw new Error(result.message || 'Failed to update load');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update load');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/shipper/loads');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading load details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Load not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Load</h1>
      </div>
      <LoadForm
        mode="edit"
        load={load}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}