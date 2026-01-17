import React from 'react';
import { Card } from './Card';
import { StatsCard } from './StatsCard';
import { Table } from './Table';

interface ImageView {
  imageUrl: string;
  totalViews: number;
  totalDuration: number;
}

interface ProductsTableProps {
  imageViews: ImageView[];
  eskimoId: string;
}

export function ProductsTable({ imageViews, eskimoId }: ProductsTableProps) {
  const totalViews = imageViews.reduce((sum, view) => sum + view.totalViews, 0);

  const columns = [
    {
      header: 'Product',
      accessor: (view: ImageView) => (
        <img src={view.imageUrl} alt="Product" className="w-20 h-20 object-cover rounded-lg" />
      )
    },
    {
      header: 'Image URL',
      accessor: (view: ImageView) => (
        <span className="max-w-xs truncate text-gray-600">{view.imageUrl}</span>
      )
    },
    {
      header: 'Views',
      accessor: (view: ImageView) => (
        <span className="font-medium text-gray-900">{view.totalViews}</span>
      )
    }
  ];

  return (
    <Card title={`User: ${eskimoId}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatsCard value={imageViews.length} label="Unique Products" color="blue" />
        <StatsCard value={totalViews} label="Total Views" color="purple" />
      </div>

      <Table columns={columns} data={imageViews} />
    </Card>
  );
}
