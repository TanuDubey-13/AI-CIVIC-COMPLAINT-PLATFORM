import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badges';
import { User, Mail, Phone, Shield, Building, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const Profile = () => {
  const { user, refreshProfile } = useAuth();

  return (
    <div className="page-wrapper" style={{ maxWidth: '700px' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Profile</h1>
          <p className="text-sm text-muted">View and manage your account details and role permissions</p>
        </div>
        <button type="button" onClick={refreshProfile} className="btn btn-outline btn-sm">
          Refresh Details
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dbeafe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user?.role} />
              {user?.isVerified ? (
                <span className="badge badge-resolved flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Email
                </span>
              ) : (
                <span className="badge badge-pending flex items-center gap-1">
                  <AlertCircle size={12} /> Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div className="flex items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Mail size={20} color="#64748b" />
            <div>
              <div className="text-xs text-muted font-semibold">Email Address</div>
              <div className="font-medium text-sm">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Phone size={20} color="#64748b" />
            <div>
              <div className="text-xs text-muted font-semibold">Phone Number</div>
              <div className="font-medium text-sm">{user?.phone || 'Not provided'}</div>
            </div>
          </div>

          {user?.department && (
            <div className="flex items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Building size={20} color="#64748b" />
              <div>
                <div className="text-xs text-muted font-semibold">Department</div>
                <div className="font-medium text-sm">{user?.department}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Calendar size={20} color="#64748b" />
            <div>
              <div className="text-xs text-muted font-semibold">Member Since</div>
              <div className="font-medium text-sm">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
