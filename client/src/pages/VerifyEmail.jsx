import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authAPI';
import { AlertMessage, LoadingSpinner } from '../components/CommonUI';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export const VerifyEmail = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setLoading(false);
        setMessage('No verification token provided.');
        return;
      }

      try {
        const res = await verifyEmail(token);
        setSuccess(true);
        setMessage(res.message || 'Email verified successfully!');
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || 'Email verification failed or token has expired.');
      } finally {
        setLoading(false);
      }
    };

    handleVerify();
  }, [token]);

  return (
    <div className="page-wrapper" style={{ maxWidth: '460px', marginTop: '3rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        {loading ? (
          <LoadingSpinner text="Verifying your email address..." size="lg" />
        ) : success ? (
          <div>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Email Verified!
            </h2>
            <p className="text-sm text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-primary w-full">
              Proceed to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div>
            <XCircle size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Verification Failed
            </h2>
            <p className="text-sm text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-secondary w-full">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
