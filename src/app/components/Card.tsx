import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export function Card({ children, title }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {title && <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>}
      {children}
    </div>
  );
}
