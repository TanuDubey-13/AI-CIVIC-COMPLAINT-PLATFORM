import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertMessage } from '../components/CommonUI';
import { LogIn, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(formData);
      // Determine redirection
      const destination =
        location.state?.from?.pathname ||
        (loggedInUser.role === 'admin'
          ? '/admin/dashboard'
          : loggedInUser.role === 'officer'
          ? '/officer/dashboard'
          : '/citizen/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '460px', marginTop: '2rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏛️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Sign In to CivicPulse</h2>
          <p className="text-sm text-muted mt-1">Access your citizen, officer, or admin account</p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                Password
              </label>
              <Link to="/forgot-password" className="text-xs" style={{ fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff' }} />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} /> Sign In
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <p className="text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create Citizen Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
