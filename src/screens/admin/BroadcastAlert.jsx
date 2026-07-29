import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Send, Bell } from 'lucide-react';

export default function BroadcastAlert() {
  const [title, setTitle] = useState('🍵 Tea Time Started');
  const [body, setBody] = useState('Tap to place your order now!');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert('Please fill in both title and message body.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/send-notification', {
        title,
        body
      });
      alert('Push alerts triggered successfully: ' + (res.data.message || 'Notification sent'));
      navigate('/setup');
    } catch (err) {
      alert(err.message || 'Broadcast trigger failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="broadcast-alert-view">
      <header className="page-header">
        <button className="btn btn-secondary btn-icon-round back-btn" onClick={() => navigate('/setup')} title="Back to setup">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ marginTop: '1rem' }}>Broadcast Push Alerts</h1>
        <p className="subtitle">Dispatch instant push notification alerts to all employee active sessions</p>
      </header>

      <div className="broadcast-container card card-header-accent" style={{ marginTop: '2rem', maxWidth: '600px' }}>
        <div className="broadcast-header-icon flex-between" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Bell size={20} className="accent-color-text" />
            <h3 style={{ fontSize: '1.2rem' }}>Custom Alert Notification</h3>
          </div>
          <span className="badge badge-warning">Broadcast</span>
        </div>

        <form onSubmit={handleBroadcast}>
          <div className="form-group">
            <label htmlFor="notif-title">Alert Title *</label>
            <input
              id="notif-title"
              type="text"
              placeholder="e.g. 🍵 Tea Time Started"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="notif-body">Notification Message Body *</label>
            <textarea
              id="notif-body"
              rows="4"
              placeholder="e.g. Ordering window is open. Submit your drink selection..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full send-broadcast-btn ${submitting ? 'btn-disabled' : ''}`}
            disabled={submitting}
            style={{ marginTop: '2.5rem', height: '48px' }}
          >
            <Send size={16} />
            {submitting ? 'Dispatching Broadcast...' : 'Broadcast Notification'}
          </button>
        </form>
      </div>

      <style>{`
        .accent-color-text {
          color: var(--color-accent);
        }

        .back-btn {
          width: 36px;
          height: 36px;
        }

        .send-broadcast-btn {
          font-weight: 700;
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
      `}</style>
    </div>
  );
}
