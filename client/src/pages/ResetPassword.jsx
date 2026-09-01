import React, { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authAPI';
import { AlertMessage } from '../components/CommonUI';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';

export const ResetPassword = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing from the URL.');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Both password fields are required.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await resetPassword(token, formData);
      setSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '460px', marginTop: '2rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Set New Password</h2>
          <p className="text-sm text-muted mt-1">Enter your new secure password below</p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />
        <AlertMessage type="success" message={success} />

        {success ? (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-primary w-full">
              Proceed to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
