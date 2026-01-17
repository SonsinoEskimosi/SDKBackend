import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html>
      <head>
        <title>Analytics Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </body>
    </html>
  );
}
