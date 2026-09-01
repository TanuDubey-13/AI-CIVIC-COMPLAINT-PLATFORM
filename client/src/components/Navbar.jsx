import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Shield, Check, Trash2, Home, Menu } from 'lucide-react';
import { RoleBadge } from './Badges';
import * as notificationAPI from '../services/notificationAPI';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationAPI.getNotifications({ limit: 5 });
      if (data && data.notifications) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // Quietly handle notification fetch failures
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Click outside to close notification menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.375rem' }}
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>🏛️</span>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1e293b' }}>
                CivicPulse <span style={{ color: '#2563eb' }}>AI</span>
              </span>
              <span className="text-xs text-muted" style={{ display: 'block', marginTop: '-3px' }}>
                AI Civic Platform
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notification Popover */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="btn btn-outline btn-sm"
                  style={{ position: 'relative', padding: '0.5rem' }}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: '50%',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '320px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span className="font-semibold text-sm">Notifications</span>
                      <Link
                        to="/notifications"
                        className="text-xs font-semibold"
                        onClick={() => setShowNotifications(false)}
                      >
                        View All
                      </Link>
                    </div>

                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted">No notifications yet.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: n.isRead ? 'transparent' : '#f8fafc',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <div className="font-semibold text-xs text-main">{n.title}</div>
                              <div className="text-xs text-muted mt-1">{n.message}</div>
                              <div className="text-xs text-light mt-1">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(n._id, e)}
                                className="btn btn-sm btn-outline"
                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User badge and menu */}
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ lineHeight: 1.2 }}>
                    <div className="font-semibold text-sm">{user?.name}</div>
                    <RoleBadge role={user?.role} />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  style={{ marginLeft: '0.5rem' }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
