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
    }
  };

  return (
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
