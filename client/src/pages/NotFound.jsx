import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="page-wrapper" style={{ maxWidth: '500px', textAlign: 'center', marginTop: '4rem' }}>
      <div className="card" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>404</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem' }}>
          Page Not Found
        </h2>
        <p className="text-sm text-muted mb-6">
          The civic platform page you are looking for does not exist or has been relocated.
        </p>

        <div className="flex justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
