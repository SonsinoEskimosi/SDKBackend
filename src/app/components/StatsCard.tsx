import React from 'react';

interface StatsCardProps {
  value: number;
  label: string;
  color: 'blue' | 'purple';
}

export function StatsCard({ value, label, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6 text-center`}>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-gray-600 mt-2">{label}</div>
    </div>
  );
}
