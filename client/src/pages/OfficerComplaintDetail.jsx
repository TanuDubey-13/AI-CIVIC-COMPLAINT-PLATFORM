import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as officerAPI from '../services/officerAPI';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Upload,
  User,
  Phone,
  Mail,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export const OfficerComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Form states for officer actions
  const [newStatus, setNewStatus] = useState('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [newPriority, setNewPriority] = useState('Medium');
  const [priorityLoading, setPriorityLoading] = useState(false);

  const [officerNote, setOfficerNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const [visitLoading, setVisitLoading] = useState(false);

  // Proof photos
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [proofLoading, setProofLoading] = useState(false);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await officerAPI.getOfficerComplaintById(id);
      if (res && res.complaint) {
        setComplaint(res.complaint);
        setNewStatus(res.complaint.status);
        setNewPriority(res.complaint.priority);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await officerAPI.updateComplaintStatus(id, {
        status: newStatus,
        resolutionNote: resolutionNote.trim(),
      });
      setActionSuccess(`Status successfully updated to "${newStatus}"!`);
      setComplaint(res.complaint);
      setResolutionNote('');
    } catch (err) {
      setError(err.message || 'Failed to update complaint status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePriorityUpdate = async (e) => {
    e.preventDefault();
    setPriorityLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await officerAPI.updateComplaintPriority(id, newPriority);
      setActionSuccess(`Priority updated to "${newPriority}"!`);
      setComplaint(res.complaint);
    } catch (err) {
      setError(err.message || 'Failed to update priority.');
    } finally {
      setPriorityLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!officerNote.trim()) return;

    setNoteLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await officerAPI.addOfficerNote(id, officerNote.trim());
      setActionSuccess('Field inspection note recorded successfully!');
      setComplaint(res.complaint);
      setOfficerNote('');
    } catch (err) {
      setError(err.message || 'Failed to add note.');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleMarkVisit = async () => {
    setVisitLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await officerAPI.markLocationVisited(id);
      setActionSuccess('Location site visit logged successfully with timestamp!');
      setComplaint(res.complaint);
    } catch (err) {
      setError(err.message || 'Failed to mark visit.');
    } finally {
      setVisitLoading(false);
    }
  };

  const handleProofUpload = async (e) => {
    e.preventDefault();
    if (beforeFiles.length === 0 && afterFiles.length === 0) {
      setError('Please select at least one photo to upload.');
      return;
    }

    setProofLoading(true);
    setError('');
    setActionSuccess('');

    try {
      const formData = new FormData();
      for (const file of beforeFiles) {
        formData.append('before', file);
      }
      for (const file of afterFiles) {
        formData.append('after', file);
      }

      const res = await officerAPI.uploadProof(id, formData);
      setActionSuccess('Field proof photos uploaded to Cloudinary successfully!');
      setComplaint(res.complaint);
      setBeforeFiles([]);
      setAfterFiles([]);
    } catch (err) {
      setError(err.message || 'Failed to upload proof photos.');
    } finally {
      setProofLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading complaint task..." size="lg" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        <AlertMessage type="danger" message={error} />
        <button onClick={() => navigate('/officer/complaints')} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Assigned List
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px' }}>
      <div className="mb-4">
        <button
          onClick={() => navigate('/officer/complaints')}
          className="btn btn-outline btn-sm flex items-center gap-1 mb-3"
        >
          <ArrowLeft size={14} /> Back to Assigned Tasks
        </button>

        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={complaint?.status} />
              <PriorityBadge priority={complaint?.priority} />
              <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                {complaint?.category}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{complaint?.title}</h1>
          </div>
          <div className="text-xs text-muted">
            ID: <code>{complaint?._id}</code>
          </div>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column: Complaint Details & Citizen Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Complaint Information</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', fontSize: '0.9375rem' }}>
              {complaint?.description}
            </p>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {complaint?.location?.address && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={16} /> <strong>Location:</strong> {complaint.location.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar size={16} /> <strong>Reported On:</strong> {new Date(complaint?.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Citizen Contact Card */}
          {complaint?.citizen && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Citizen Contact</h2>
              <div className="flex items-center gap-3">
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {complaint.citizen.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="font-bold text-sm text-main">{complaint.citizen.name}</div>
                  <div className="text-xs text-muted flex items-center gap-1 mt-1">
                    <Mail size={12} /> {complaint.citizen.email}
                  </div>
                  {complaint.citizen.phone && (
                    <div className="text-xs text-muted flex items-center gap-1 mt-1">
                      <Phone size={12} /> {complaint.citizen.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Original Reported Image */}
          {complaint?.image && (
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Citizen Reported Image</h2>
              <img
                src={complaint.image}
                alt="Reported defect"
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
          )}

          {/* Existing Notes & History */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>Field Notes & Log</h2>
            {complaint?.visitedAt && (
              <div className="alert alert-info p-2 text-xs mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> Location Visited on {new Date(complaint.visitedAt).toLocaleString()}
              </div>
            )}

            {!complaint?.notes || complaint.notes.length === 0 ? (
              <div className="text-xs text-muted">No officer notes recorded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaint.notes.map((n, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div className="text-xs text-main" style={{ whiteSpace: 'pre-wrap' }}>{n.note}</div>
                    <div className="text-xs text-light mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Officer Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action 1: Update Status & Resolution Note */}
          <div className="card" style={{ border: '2px solid #bfdbfe' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1e40af' }}>
              1. Update Resolution Status
            </h2>

            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  New Status
                </label>
                <select
                  id="status"
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {newStatus === 'Resolved' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="resolutionNote">
                    Resolution Note for Citizen
                  </label>
                  <textarea
                    id="resolutionNote"
                    className="form-control"
                    placeholder="e.g. Repair crew repaired the street light bulb and restored power."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={statusLoading}>
                {statusLoading ? 'Updating Status...' : 'Save Status Update'}
              </button>
            </form>
          </div>

          {/* Action 2: Log Site Visit */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Field Inspection Visit
            </h2>
            <p className="text-xs text-muted mb-3">
              Log that you have physically inspected the site location.
            </p>
            <button
              type="button"
              onClick={handleMarkVisit}
              className="btn btn-outline w-full"
              disabled={visitLoading || Boolean(complaint?.visitedAt)}
            >
              <CheckCircle2 size={16} color="#16a34a" />
              {complaint?.visitedAt
                ? `Visited on ${new Date(complaint.visitedAt).toLocaleDateString()}`
                : visitLoading
                ? 'Logging Visit...'
                : 'Mark Site Visited'}
            </button>
          </div>

          {/* Action 3: Add Officer Note */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              3. Add Officer Note
            </h2>
            <form onSubmit={handleAddNote}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Record internal inspection findings or next steps..."
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  rows={2}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm w-full" disabled={noteLoading}>
                {noteLoading ? 'Saving Note...' : 'Add Note to Log'}
              </button>
            </form>
          </div>

          {/* Action 4: Upload Proof Photos to Cloudinary */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              4. Upload Resolution Proof (Cloudinary)
            </h2>
            <form onSubmit={handleProofUpload}>
              <div className="form-group">
                <label className="form-label text-xs">Before Work Photos:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setBeforeFiles(Array.from(e.target.files))}
                  className="form-control text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">After Work Photos:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setAfterFiles(Array.from(e.target.files))}
                  className="form-control text-xs"
                />
              </div>

              <button type="submit" className="btn btn-secondary btn-sm w-full" disabled={proofLoading}>
                <Upload size={14} />
                {proofLoading ? 'Uploading to Cloudinary...' : 'Upload Proof Images'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
