import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card>
      <div className="text-center text-gray-500 py-4">
        {message}
      </div>
    </Card>
  );
}
