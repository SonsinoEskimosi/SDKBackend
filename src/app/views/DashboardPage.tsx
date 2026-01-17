import React from 'react';

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
    <html>
      <head>
        <title>Analytics Dashboard</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          .container { max-width: 1200px; margin: 0 auto; }
          .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 20px; }
          .search-form { display: flex; gap: 10px; }
          .search-input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
          .search-button {
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .search-button:hover { background: #0056b3; }
          .results {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
          }
          .stat-value { font-size: 32px; font-weight: bold; color: #007bff; }
          .stat-label { color: #666; margin-top: 5px; }
          .table-container { overflow-x: auto; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          .image-preview {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
          }
          .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>📊 Analytics Dashboard</h1>
            <form method="GET" action="/dashboard" className="search-form">
              <input
                type="text"
                name="eskimoId"
                placeholder="Enter Eskimo ID..."
                defaultValue={eskimoId || ''}
                className="search-input"
                required
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {imageViews && imageViews.length > 0 && (
            <div className="results">
              <h2 style={{ marginBottom: '20px' }}>User: {eskimoId}</h2>
              
              <div className="stats">
                <div className="stat-card">
                  <div className="stat-value">{imageViews.length}</div>
                  <div className="stat-label">Unique Products</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {imageViews.reduce((sum, view) => sum + view.totalViews, 0)}
                  </div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Image URL</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imageViews.map((view, index) => (
                      <tr key={index}>
                        <td>
                          <img src={view.imageUrl} alt="Product" className="image-preview" />
                        </td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {view.imageUrl}
                        </td>
                        <td>{view.totalViews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {imageViews && imageViews.length === 0 && eskimoId && (
            <div className="results">
              <div className="no-data">
                No data found for this Eskimo ID
              </div>
            </div>
          )}

          {!eskimoId && recentUsers && recentUsers.length > 0 && (
            <div className="results">
              <h2 style={{ marginBottom: '20px' }}>Recent Users</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Eskimo ID</th>
                      <th>Host</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user, index) => (
                      <tr key={index}>
                        <td style={{ fontFamily: 'monospace' }}>{user.eskimoId}</td>
                        <td>{user.host}</td>
                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                        <td>
                          <a
                            href={`/dashboard?eskimoId=${user.eskimoId}`}
                            style={{
                              color: '#007bff',
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            View Analytics →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
