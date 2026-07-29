import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, Clock } from 'lucide-react';

export default function TimeSettings() {
  const [teaTimeStart, setTeaTimeStart] = useState('16:55');
  const [cutoffTime, setCutoffTime] = useState('17:10');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.orderingWindow) {
          setTeaTimeStart(res.data.orderingWindow.teaTimeStart || '16:55');
          setCutoffTime(res.data.orderingWindow.cutoffTime || '17:10');
        }
      } catch (err) {
        console.error('Failed to load active window settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teaTimeStart || !cutoffTime) {
      alert('Please fill in both start and cutoff times.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/settings', {
        teaTimeStart,
        cutoffTime
      });
      alert('Ordering window schedule updated successfully.');
      navigate('/setup');
    } catch (err) {
      alert(err.message || 'Settings update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="time-settings-view">
      <header className="page-header">
        <button className="btn btn-secondary btn-icon-round back-btn" onClick={() => navigate('/setup')} title="Back to setup">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ marginTop: '1rem' }}>Configure Ordering Window</h1>
        <p className="subtitle">Set automated schedules for when tea ordering opens and locks daily</p>
      </header>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="settings-container card card-header-accent" style={{ marginTop: '2rem', maxWidth: '600px' }}>
          <div className="settings-header-icon flex-between" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Clock size={20} className="primary-color-text" />
              <h3 style={{ fontSize: '1.2rem' }}>Daily Clock Settings</h3>
            </div>
            <span className="badge badge-muted">Automated Rules</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="start-time">Tea Time Activation Time (24h format)</label>
              <input
                id="start-time"
                type="time"
                value={teaTimeStart}
                onChange={(e) => setTeaTimeStart(e.target.value)}
                required
              />
              <p className="desc-text" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                The time daily when ordering automatically unlocks and employees can request beverages.
              </p>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="cutoff-time">Ordering Cutoff Time (24h format)</label>
              <input
                id="cutoff-time"
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                required
              />
              <p className="desc-text" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                The strict cutoff point when submissions lock. Placing or cancelling orders will be blocked.
              </p>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full save-settings-btn ${submitting ? 'btn-disabled' : ''}`}
              disabled={submitting}
              style={{ marginTop: '2.5rem', height: '48px' }}
            >
              <Save size={16} />
              {submitting ? 'Saving Schedules...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      <style>{`
        .primary-color-text {
          color: var(--color-primary);
        }

        .back-btn {
          width: 36px;
          height: 36px;
        }

        .save-settings-btn {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
