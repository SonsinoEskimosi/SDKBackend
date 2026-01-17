import React from 'react';
import { Layout } from '../components/Layout';
import { SearchBar } from '../components/SearchBar';
import { ErrorAlert } from '../components/ErrorAlert';
import { ProductsTable } from '../components/ProductsTable';
import { UsersTable } from '../components/UsersTable';
import { EmptyState } from '../components/EmptyState';

interface ImageViewData {
  imageUrl: string;
  totalViews: number;
  totalDuration: number;
}

interface User {
  eskimoId: string;
  host: string;
  createdAt: string;
}

interface DashboardPageProps {
  eskimoId?: string;
  imageViews?: ImageViewData[];
  recentUsers?: User[];
  error?: string;
}

export function DashboardPage({ eskimoId, imageViews, recentUsers, error }: DashboardPageProps) {
  return (
    <Layout>
      <SearchBar defaultValue={eskimoId} />

      {error && <ErrorAlert message={error} />}

      {imageViews && imageViews.length > 0 && (
        <ProductsTable imageViews={imageViews} eskimoId={eskimoId!} />
      )}

      {imageViews && imageViews.length === 0 && eskimoId && (
        <EmptyState message="No data found for this Eskimo ID" />
      )}

      {!eskimoId && recentUsers && recentUsers.length > 0 && (
        <UsersTable users={recentUsers} />
      )}
    </Layout>
  );
}
