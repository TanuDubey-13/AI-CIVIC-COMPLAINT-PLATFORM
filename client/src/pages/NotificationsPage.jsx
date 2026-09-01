import React, { useState, useEffect } from 'react';
import * as notificationAPI from '../services/notificationAPI';
import { LoadingSpinner, AlertMessage } from '../components/CommonUI';
import { Bell, Check, Trash2, CheckCheck, Clock } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await notificationAPI.getNotifications({ limit: 50 });
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.message || 'Failed to mark as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setSuccess('All notifications marked as read.');
    } catch (err) {
      setError(err.message || 'Failed to mark all as read.');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete notification.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;

    try {
      await notificationAPI.deleteAllNotifications();
      setNotifications([]);
      setSuccess('All notifications cleared.');
    } catch (err) {
      setError(err.message || 'Failed to delete notifications.');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Notification Center</h1>
          <p className="text-sm text-muted">Real-time alerts on complaint status updates and system assignments</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="btn btn-outline btn-sm"
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
            <button
              type="button"
              onClick={handleDeleteAll}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner text="Fetching notifications..." size="lg" />
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔕</div>
          <h3 className="font-bold text-main">No Notifications</h3>
          <p className="text-sm text-muted mt-1">You're all caught up! Updates regarding your complaints will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                borderLeft: n.isRead ? '1px solid #e2e8f0' : '4px solid #2563eb',
                backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-main">{n.title}</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem' }}>
                    {n.type || 'General'}
                  </span>
                </div>
                <p className="text-sm text-muted" style={{ lineHeight: 1.4 }}>
                  {n.message}
                </p>
                <div className="text-xs text-light mt-2 flex items-center gap-1">
                  <Clock size={12} /> {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n._id)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteNotification(n._id)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
