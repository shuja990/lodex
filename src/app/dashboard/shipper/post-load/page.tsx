'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadForm from '@/components/loads/LoadForm';
import { CreateLoadRequest, UpdateLoadRequest } from '@/types/load';
import { useAuthStore, fetchWithAuth } from '@/store/auth';

export default function PostLoadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleCreateLoad = async (data: CreateLoadRequest | UpdateLoadRequest) => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    const createData = data as CreateLoadRequest;
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth('/api/loads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create load');
      }

      const result = await response.json();
      
      if (result.success) {
        // Redirect to the loads page after successful creation
        router.push('/dashboard/shipper/loads');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create load');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/shipper');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Load</h1>
        <p className="text-gray-600">Fill out the details below to post your load</p>
      </div>

      <LoadForm
        mode="create"
        onSubmit={handleCreateLoad}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}