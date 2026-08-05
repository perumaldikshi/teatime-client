import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Save, Clock, Unlock, Lock, RotateCcw } from 'lucide-react';

export default function TimeSettings() {
  const [teaTimeStart, setTeaTimeStart] = useState('16:55');
  const [cutoffTime, setCutoffTime] = useState('17:10');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [override, setOverride] = useState(null); // null | 'open' | 'closed'
  const [toastMsg, setToastMsg] = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.orderingWindow) {
          setTeaTimeStart(res.data.orderingWindow.teaTimeStart || '16:55');
          setCutoffTime(res.data.orderingWindow.cutoffTime || '17:10');
          setOverride(res.data.orderingWindow.override || null);
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
      showToast('✅ Schedule updated successfully!');
    } catch (err) {
      showToast(err.message || 'Settings update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceToggle = async (action) => {
    setToggling(true);
    try {
      await api.post('/settings/force-toggle', { action });
      setOverride(action === 'auto' ? null : action);
      const msg =
        action === 'open' ? '🔓 Ordering force opened!' :
        action === 'closed' ? '🔒 Ordering force closed!' :
        '🕐 Reverted to automatic schedule';
      showToast(msg);
    } catch (err) {
      showToast(err.message || 'Toggle failed.');
    } finally {
      setToggling(false);
    }
  };

  const overrideLabel =
    override === 'open' ? { text: 'Force Open (Active)', color: '#22c55e' } :
    override === 'closed' ? { text: 'Force Closed (Active)', color: '#ef4444' } :
    { text: 'Auto (Time-based)', color: '#6b7280' };

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
        <>
          {/* ── FORCE CONTROL CARD ── */}
          <div className="card card-header-accent force-card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
              <Lock size={20} className="primary-color-text" />
              <h3 style={{ fontSize: '1.1rem' }}>Manual Override</h3>
              <span className="badge" style={{ backgroundColor: overrideLabel.color, color: '#fff', marginLeft: 'auto' }}>
                {overrideLabel.text}
              </span>
            </div>
            <p className="desc-text" style={{ marginBottom: '1.2rem', fontSize: '0.85rem' }}>
              Override the automatic schedule. Use this when you want to open or close ordering outside the set hours.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                id="btn-force-open"
                className={`btn ${override === 'open' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleForceToggle('open')}
                disabled={toggling || override === 'open'}
                style={{ flex: 1, minWidth: '120px' }}
              >
                <Unlock size={15} />
                Force Open
              </button>
              <button
                id="btn-force-close"
                className={`btn ${override === 'closed' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => handleForceToggle('closed')}
                disabled={toggling || override === 'closed'}
                style={{ flex: 1, minWidth: '120px' }}
              >
                <Lock size={15} />
                Force Close
              </button>
              <button
                id="btn-revert-auto"
                className="btn btn-secondary"
                onClick={() => handleForceToggle('auto')}
                disabled={toggling || override === null}
                style={{ flex: 1, minWidth: '120px' }}
              >
                <RotateCcw size={15} />
                Auto (Reset)
              </button>
            </div>
          </div>

          {/* ── SCHEDULE SETTINGS CARD ── */}
          <div className="settings-container card card-header-accent" style={{ marginTop: '1.5rem', maxWidth: '600px' }}>
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
        </>
      )}

      {/* ── TOAST ── */}
      {toastMsg && (
        <div className="ts-toast">
          {toastMsg}
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

        .force-card {
          border-left: 3px solid var(--color-primary);
        }

        .btn-success {
          background: #22c55e;
          color: #fff;
          border: none;
        }
        .btn-outline-success {
          background: transparent;
          color: #22c55e;
          border: 1.5px solid #22c55e;
        }
        .btn-outline-success:hover:not(:disabled) {
          background: #22c55e;
          color: #fff;
        }
        .btn-danger {
          background: #ef4444;
          color: #fff;
          border: none;
        }
        .btn-outline-danger {
          background: transparent;
          color: #ef4444;
          border: 1.5px solid #ef4444;
        }
        .btn-outline-danger:hover:not(:disabled) {
          background: #ef4444;
          color: #fff;
        }

        .ts-toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 9999;
          animation: fadeInUp 0.25s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
