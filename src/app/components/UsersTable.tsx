import React from 'react';
import { Card } from './Card';
import { Table } from './Table';

interface User {
  eskimoId: string;
  host: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const columns = [
    {
      header: 'Eskimo ID',
      accessor: (user: User) => (
        <span className="font-mono text-sm text-gray-900">{user.eskimoId}</span>
      )
    },
    {
      header: 'Host',
      accessor: (user: User) => (
        <span className="text-gray-600">{user.host}</span>
      )
    },
    {
      header: 'Created At',
      accessor: (user: User) => (
        <span className="text-gray-600">{new Date(user.createdAt).toLocaleString()}</span>
      )
    },
    {
      header: 'Action',
      accessor: (user: User) => (
        <a
          href={`/dashboard?eskimoId=${user.eskimoId}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View Analytics →
        </a>
      )
    }
  ];

  return (
    <Card title="Recent Users">
      <Table columns={columns} data={users} />
    </Card>
  );
}
