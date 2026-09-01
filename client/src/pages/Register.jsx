import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertMessage } from '../components/CommonUI';
import { UserPlus, CheckCircle } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await register(formData);
      setSuccessMsg('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        if (user?.role === 'admin') navigate('/admin/dashboard');
        else if (user?.role === 'officer') navigate('/officer/dashboard');
        else navigate('/citizen/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '520px', marginTop: '1.5rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✍️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Create CivicPulse Account</h2>
          <p className="text-sm text-muted mt-1">Join the civic platform to report issues and track resolutions</p>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />
        <AlertMessage type="success" message={successMsg} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              minLength={3}
              required
            />
          </div>

          <div className="grid grid-2 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="+1 555 0192"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-2 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
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
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Account Role
            </label>
            <select id="role" name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="citizen">Citizen (Report & Track Issues)</option>
              <option value="officer">Field Officer (Resolve Assigned Issues)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#fff' }} />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={18} /> Register Account
              </span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
