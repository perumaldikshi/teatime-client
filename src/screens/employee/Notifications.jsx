import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, RefreshCw, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setError('');
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatDateTime = (sentAt) => {
    const d = new Date(sentAt);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="notifications-view">
      <header className="page-header flex-between">
        <div>
          <h1>Alerts & Broadcasts</h1>
          <p className="subtitle">Important updates regarding ordering schedules and tea sessions</p>
        </div>
        <button 
          className="btn btn-secondary btn-icon-round" 
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh notifications"
        >
          <RefreshCw size={18} className={refreshing ? 'spin-icon' : ''} />
        </button>
      </header>

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      {loading && !refreshing ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="notifications-list" style={{ marginTop: '2rem' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((item) => (
              <div key={item.id} className="card notification-card">
                <div className="notification-icon-col">
                  <span className="bell-badge">🔔</span>
                </div>
                <div className="notification-content-col">
                  <div className="notification-header flex-between">
                    <h3 className="notification-title">{item.title}</h3>
                    <span className="notification-time">
                      <Clock size={12} />
                      {formatDateTime(item.sent_at)}
                    </span>
                  </div>
                  <p className="notification-body">{item.body}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-notifications card">
              <Bell size={48} className="empty-icon" />
              <h4>No new notifications</h4>
              <p>Everything is currently quiet. Any broad announcements will appear here.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-card {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          padding: 1.5rem;
        }

        .bell-badge {
          font-size: 1.5rem;
          background-color: var(--color-background);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border);
        }

        .notification-content-col {
          flex: 1;
        }

        .notification-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 500;
        }

        .notification-body {
          margin-top: 0.5rem;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .empty-notifications {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--color-text-secondary);
        }

        .empty-icon {
          color: var(--color-border);
          margin-bottom: 1rem;
        }

        .empty-notifications h4 {
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
