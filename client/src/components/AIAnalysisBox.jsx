import React from 'react';
import { Sparkles, Check, AlertTriangle, Cpu, ArrowRight } from 'lucide-react';
import { PriorityBadge } from './Badges';

export const AIAnalysisBox = ({ analysis, onApply, loading }) => {
  if (loading) {
    return (
      <div className="card" style={{ background: '#f8fafc', border: '1px dashed #94a3b8', margin: '1rem 0' }}>
        <div className="flex items-center gap-3">
          <div className="spinner" style={{ width: '20px', height: '20px' }} />
          <div>
            <div className="font-semibold text-sm">Gemini AI is analyzing complaint details...</div>
            <div className="text-xs text-muted">Classifying category, estimating severity, and checking for duplicates.</div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
        border: '1px solid #bfdbfe',
        margin: '1.25rem 0',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} color="#2563eb" />
          <span className="font-bold text-sm" style={{ color: '#1e40af' }}>
            Gemini AI Civic Analysis
          </span>
          {analysis.confidence && (
            <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              {analysis.confidence}% Confidence
            </span>
          )}
        </div>
        {onApply && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onApply(analysis)}
          >
            <Check size={14} /> Apply Suggestions
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div className="text-xs text-muted font-semibold">Suggested Category</div>
          <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{analysis.category || 'Other'}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div className="text-xs text-muted font-semibold">Estimated Severity</div>
          <div className="mt-1">
            <PriorityBadge priority={analysis.severity || 'Medium'} />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.625rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div className="text-xs text-muted font-semibold">Target Department</div>
          <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{analysis.department || 'Municipal Corporation'}</div>
        </div>
      </div>

      {analysis.summary && (
        <div className="mt-2 text-xs" style={{ color: '#334155', background: 'rgba(255,255,255,0.6)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
          <strong>AI Summary:</strong> {analysis.summary}
        </div>
      )}

      {analysis.duplicate && (
        <div
          className="mt-2 flex items-center gap-2 text-xs p-2"
          style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', border: '1px solid #fde68a' }}
        >
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span>
            <strong>Possible Duplicate Detected!</strong> This issue appears {analysis.duplicatePercentage}% similar to an existing report.
          </span>
        </div>
      )}
    </div>
  );
};
