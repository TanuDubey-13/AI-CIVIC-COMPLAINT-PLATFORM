import { useState, useRef } from "react";
import { analyzeComplaint } from "../../services/aiService";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUploader({ onImageSelect, setAIResult }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateFile = (selected) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      return "Please upload a JPEG, PNG, WebP, or GIF image.";
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Image must be smaller than ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleImage = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setFile(selected);
    onImageSelect(selected);
    setPreview(URL.createObjectURL(selected));
    if (setAIResult) setAIResult(null);
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const response = await analyzeComplaint(file);
      if (setAIResult) setAIResult(response.data);
    } catch {
      setError("AI analysis failed. You can still submit manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className={`upload-zone ${preview ? "has-image" : ""}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImage}
          style={{ display: "none" }}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</p>
            <p style={{ fontWeight: 600, color: "var(--primary)" }}>Click to upload image</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              JPEG, PNG, WebP up to {MAX_SIZE_MB}MB
            </p>
          </>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}

      {file && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={analyzeImage}
          disabled={loading}
          style={{ marginTop: "0.5rem" }}
        >
          {loading ? "Analyzing with AI..." : "Analyze Issue with AI"}
        </button>
      )}
    </div>
  );
}
