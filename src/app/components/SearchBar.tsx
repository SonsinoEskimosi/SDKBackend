import React from 'react';
import { Card } from './Card';

interface SearchBarProps {
  defaultValue?: string;
}

const inputClasses = "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonClasses = "px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors";

export function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <div className="mb-6">
      <Card>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Analytics Dashboard</h1>
        <form method="GET" action="/dashboard" className="flex gap-3">
          <input
            type="text"
            name="eskimoId"
            placeholder="Enter Eskimo ID..."
            defaultValue={defaultValue || ''}
            className={inputClasses}
            required
          />
          <button type="submit" className={buttonClasses}>
            Search
          </button>
        </form>
      </Card>
    </div>
  );
}
