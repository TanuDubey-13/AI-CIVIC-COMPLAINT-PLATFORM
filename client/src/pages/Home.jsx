import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, CheckCircle, ArrowRight, Activity, MapPin, Zap } from 'lucide-react';

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/citizen/dashboard';
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: '#ffffff',
          padding: '3.5rem 2rem',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <Sparkles size={16} /> Powered by Gemini AI & Real-time GIS
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          AI-Powered Civic Complaint & Governance Platform
        </h1>
        <p style={{ fontSize: '1.125rem', maxWidth: '700px', margin: '0 auto 2rem', opacity: 0.9 }}>
          Report municipal issues, track resolutions in real-time, and empower city administration with automated AI categorization, duplicate detection, and smart field assignments.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={getDashboardLink()} className="btn btn-lg" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
              Go to Your Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
                Register as Citizen <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-lg btn-outline" style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#ffffff' }}>
                Sign In to Platform
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center' }}>
        How CivicPulse AI Solves Urban Issues
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8', marginBottom: '1rem' }}>
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Gemini AI Auto-Classification</h3>
          <p className="text-sm text-muted">
            Instantly analyzes issue descriptions, identifies appropriate municipal departments, predicts urgency severity, and flags duplicate reports.
          </p>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a', marginBottom: '1rem' }}>
            <CheckCircle size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Transparent Resolution Flow</h3>
          <p className="text-sm text-muted">
            End-to-end tracking with Cloudinary photo verification, field officer notes, location visits, and instant status updates for citizens.
          </p>
        </div>

        <div className="card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed', marginBottom: '1rem' }}>
            <Shield size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Role-Based Governance</h3>
          <p className="text-sm text-muted">
            Dedicated portals for Citizens, Field Officers, and Municipal Administrators with full role authorization and analytics.
          </p>
        </div>
      </div>
    </div>
  );
};
