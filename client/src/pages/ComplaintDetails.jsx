import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getComplaintById } from '../services/complaintAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Building,
  Image as ImageIcon,
} from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getComplaintById(id);
      if (res && res.complaint) {
        setComplaint(res.complaint);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading complaint details..." size="lg" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <AlertMessage type="danger" message={error || 'Complaint not found.'} />
        <button onClick={() => navigate(-1)} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm flex items-center gap-1 mb-3"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                {complaint.category}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{complaint.title}</h1>
          </div>
          <div className="text-xs text-muted">
            Reference ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{complaint._id}</code>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Description</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', fontSize: '0.9375rem' }}>
              {complaint.description}
            </p>

            {complaint.remarks && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div className="text-xs font-semibold text-muted mb-1">Remarks & Status History:</div>
                <div className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{complaint.remarks}</div>
              </div>
            )}
          </div>

          {/* Cloudinary Complaint Photo */}
          {complaint.image && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Reported Photo (Cloudinary)
              </h2>
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <img
                  src={complaint.image}
                  alt={complaint.title}
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Proof Images if resolved by officer */}
          {complaint.proofImages && (complaint.proofImages.before?.length > 0 || complaint.proofImages.after?.length > 0) && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Field Proof Images
              </h2>
              {complaint.proofImages.before?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-muted mb-1">Before Work:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {complaint.proofImages.before.map((img, idx) => (
                      <img key={idx} src={img} alt="Before" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                  </div>
                </div>
              )}
              {complaint.proofImages.after?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted mb-1">After Resolution:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {complaint.proofImages.after.map((img, idx) => (
                      <img key={idx} src={img} alt="After" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Tracker */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Lifecycle Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="flex items-center gap-3">
                <Calendar size={18} color="#64748b" />
                <div>
                  <div className="text-xs text-muted font-semibold">Reported Date</div>
                  <div className="text-sm font-medium">{new Date(complaint.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {complaint.location?.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} color="#64748b" style={{ marginTop: '2px' }} />
                  <div>
                    <div className="text-xs text-muted font-semibold">Location</div>
                    <div className="text-sm font-medium">{complaint.location.address}</div>
                    {complaint.location.latitude && (
                      <div className="text-xs text-light mt-1">
                        Lat: {complaint.location.latitude}, Lng: {complaint.location.longitude}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {complaint.department && (
                <div className="flex items-center gap-3">
                  <Building size={18} color="#64748b" />
                  <div>
                    <div className="text-xs text-muted font-semibold">Department</div>
                    <div className="text-sm font-medium">{complaint.department}</div>
                  </div>
                </div>
              )}

              {complaint.assignedOfficer ? (
                <div className="flex items-start gap-3">
                  <Shield size={18} color="#2563eb" style={{ marginTop: '2px' }} />
                  <div>
                    <div className="text-xs text-muted font-semibold">Assigned Field Officer</div>
                    <div className="text-sm font-bold text-main">{complaint.assignedOfficer.name}</div>
                    <div className="text-xs text-muted">{complaint.assignedOfficer.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Clock size={18} color="#d97706" />
                  <div>
                    <div className="text-xs text-muted font-semibold">Assignment</div>
                    <div className="text-sm text-muted">Awaiting field officer assignment</div>
                  </div>
                </div>
              )}

              {complaint.resolvedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} color="#16a34a" />
                  <div>
                    <div className="text-xs text-muted font-semibold">Resolved On</div>
                    <div className="text-sm font-medium text-success">
                      {new Date(complaint.resolvedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Citizen Info (visible to Officer/Admin) */}
          {complaint.citizen && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Reported By</h2>
              <div className="flex items-center gap-3">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {complaint.citizen.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="font-semibold text-sm">{complaint.citizen.name}</div>
                  <div className="text-xs text-muted">{complaint.citizen.email}</div>
                  {complaint.citizen.phone && <div className="text-xs text-muted">{complaint.citizen.phone}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
