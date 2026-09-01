<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../services/complaintAPI';
import { analyzeComplaint } from '../services/aiAPI';
import { AIAnalysisBox } from '../components/AIAnalysisBox';
import { AlertMessage } from '../components/CommonUI';
import {
  Upload,
  Sparkles,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Electricity',
  'Sewage',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const CreateComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    category: 'Other',
    priority: 'Medium',
    department: '',
    remarks: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be smaller than 5MB.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (error) setError('');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
        }
      );
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!formData.title || formData.title.trim().length < 5) {
      setAiError('Please enter a title (at least 5 characters) before running AI analysis.');
      return;
    }
    if (!formData.description || formData.description.trim().length < 20) {
      setAiError('Please enter a detailed description (at least 20 characters) for accurate AI analysis.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    try {
      const res = await analyzeComplaint({
        title: formData.title,
        description: formData.description,
      });

      if (res && res.data) {
        setAiAnalysis(res.data);
      }
    } catch (err) {
      setAiError(err.message || 'AI analysis could not be completed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAISuggestions = (analysis) => {
    setFormData((prev) => ({
      ...prev,
      category: CATEGORIES.includes(analysis.category) ? analysis.category : 'Other',
      priority: PRIORITIES.includes(analysis.severity) ? analysis.severity : 'Medium',
      department: analysis.department || prev.department,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.length < 5 || formData.title.length > 100) {
      setError('Title must be between 5 and 100 characters.');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    if (!formData.address.trim()) {
      setError('Location address is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('location[address]', formData.address.trim());
      if (formData.latitude) data.append('location[latitude]', formData.latitude);
      if (formData.longitude) data.append('location[longitude]', formData.longitude);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      if (formData.department) data.append('department', formData.department.trim());
      if (formData.remarks) data.append('remarks', formData.remarks.trim());
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const res = await createComplaint(data);
      setSuccess('Complaint created successfully! Uploading image & notifying officers...');
      setTimeout(() => {
        navigate('/citizen/my-complaints');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setSubmitting(false);
=======
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import MapPicker from "../components/MapPicker/MapPicker";
import { createComplaint } from "../services/complaintService";
import { formatCategory } from "../utils/formatters";

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [aiResult, setAIResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "road_damage",
    severity: "low",
    address: "",
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const applyAIResult = (result) => {
    setAIResult(result);
    if (result?.category) {
      setForm((prev) => ({ ...prev, category: result.category }));
    }
    if (result?.severity) {
      setForm((prev) => ({ ...prev, severity: result.severity }));
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!image) {
      setError("Please upload a complaint image.");
      return;
    }
    if (!location) {
      setError("Please select a location on the map.");
      return;
    }
    if (!form.title.trim() || !form.description.trim() || !form.address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("severity", form.severity);
    data.append("location", form.address);
    data.append("latitude", location.lat);
    data.append("longitude", location.lng);
    data.append("image", image);

    setLoading(true);
    try {
      await createComplaint(data);
      setSuccess("Complaint submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
    }
  };

  return (
<<<<<<< HEAD
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="mb-6">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>File a Civic Complaint</h1>
        <p className="text-sm text-muted">
          Report urban defects with photo proof and leverage Gemini AI to auto-classify and prioritize
        </p>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} />
      <AlertMessage type="warning" message={aiError} onClose={() => setAiError('')} />

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            1. Issue Overview
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Complaint Title * <span className="text-xs text-muted">(5-100 characters)</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              placeholder="e.g. Deep pothole causing traffic jam near Sector 4"
              value={formData.title}
              onChange={handleChange}
              minLength={5}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description * <span className="text-xs text-muted">(Minimum 20 characters)</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Describe what is broken, how long it has been there, exact landmarks, or safety risks..."
              value={formData.description}
              onChange={handleChange}
              minLength={20}
              rows={4}
              required
            />
          </div>

          {/* AI Pre-Analysis Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunAIAnalysis}
              className="btn btn-secondary btn-sm"
              disabled={aiLoading}
            >
              <Sparkles size={16} color="#2563eb" />
              {aiLoading ? 'Analyzing with AI...' : 'Analyze with Gemini AI'}
            </button>
            <span className="text-xs text-muted">
              Auto-detects department, urgency severity, and potential duplicates.
            </span>
          </div>

          {/* AI Analysis Widget */}
          <AIAnalysisBox
            analysis={aiAnalysis}
            onApply={handleApplyAISuggestions}
            loading={aiLoading}
          />
        </div>

        {/* Classification & Metadata */}
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            2. Classification & Department
          </h2>

          <div className="grid grid-2 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority / Urgency
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="department">
              Target Department <span className="text-xs text-muted">(Optional)</span>
            </label>
            <input
              type="text"
              id="department"
              name="department"
              className="form-control"
              placeholder="e.g. Public Works Department (PWD), Municipal Waste Management"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Location & Photos */}
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            3. Location & Photo Proof
          </h2>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" htmlFor="address" style={{ marginBottom: 0 }}>
                Location / Address *
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-xs flex items-center gap-1 font-semibold"
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
              >
                <MapPin size={12} /> Auto-Detect GPS
              </button>
            </div>
            <input
              type="text"
              id="address"
              name="address"
              className="form-control"
              placeholder="Street address, colony, crossroad, or nearby landmark"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-2 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="latitude">
                Latitude <span className="text-xs text-muted">(Optional)</span>
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                className="form-control"
                placeholder="e.g. 28.6139"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="longitude">
                Longitude <span className="text-xs text-muted">(Optional)</span>
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                className="form-control"
                placeholder="e.g. 77.2090"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Photo Upload to Cloudinary */}
          <div className="form-group">
            <label className="form-label">
              Upload Complaint Photo (Cloudinary) <span className="text-xs text-muted">(JPEG, PNG, WebP, max 5MB)</span>
            </label>

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.5rem' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '240px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(15,23,42,0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <Upload size={32} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
                <div className="font-semibold text-sm text-main">Click or Drag & Drop image here</div>
                <div className="text-xs text-muted mt-1">Image will be securely stored on Cloudinary CDN</div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="remarks">
              Additional Remarks <span className="text-xs text-muted">(Optional)</span>
            </label>
            <input
              type="text"
              id="remarks"
              name="remarks"
              className="form-control"
              placeholder="Any other notes for field officers..."
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/citizen/dashboard')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#fff' }} />
                Submitting to Municipal Portal...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle size={20} /> Submit Civic Complaint
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
=======
    <div>
      <div className="page-header">
        <h1>Report Civic Issue</h1>
        <p>Upload a photo, let AI analyze it, and submit your complaint</p>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={submitComplaint} className="complaint-form">
        <div className="form-section">
          <h2>1. Upload Image &amp; AI Analysis</h2>
          <ImageUploader onImageSelect={setImage} setAIResult={applyAIResult} />

          {aiResult && (
            <div className="ai-panel">
              <h3>🤖 AI Analysis Results</h3>
              <div className="ai-results">
                <div className="ai-result-item">
                  <div className="label">Category</div>
                  <div className="value">{formatCategory(aiResult.category)}</div>
                </div>
                <div className="ai-result-item">
                  <div className="label">Severity</div>
                  <div className="value">{aiResult.severity}</div>
                </div>
                <div className="ai-result-item">
                  <div className="label">Confidence</div>
                  <div className="value">{Math.round((aiResult.confidence || 0) * 100)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>2. Location</h2>
          <MapPicker setLocation={setLocation} />
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label htmlFor="address">Address *</label>
            <input
              id="address"
              className="form-input"
              placeholder="Street address or landmark"
              value={form.address}
              onChange={update("address")}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>3. Complaint Details</h2>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" className="form-input" placeholder="Brief title for the issue" value={form.title} onChange={update("title")} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" className="form-textarea" placeholder="Describe the issue in detail" value={form.description} onChange={update("description")} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" className="form-select" value={form.category} onChange={update("category")}>
                <option value="road_damage">Road Damage</option>
                <option value="streetlight">Street Light</option>
                <option value="garbage">Garbage</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severity</label>
              <select id="severity" className="form-select" value={form.severity} onChange={update("severity")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
