import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authAPI';
import { AlertMessage } from '../components/CommonUI';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || 'If an account exists, a password reset link has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '460px', marginTop: '2rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Forgot Password?</h2>
          <p className="text-sm text-muted mt-1">Enter your registered email to receive a password reset link</p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />
        <AlertMessage type="success" message={message} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Sending link...' : (
              <span className="flex items-center gap-2">
                <Send size={16} /> Send Reset Link
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <Link to="/login" className="flex items-center justify-center gap-1 text-sm" style={{ fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
