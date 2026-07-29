import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { RefreshCw, Power, Users, DollarSign, ListOrdered, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminStats = async () => {
    setError('');
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleToggleOrdering = async (currentState) => {
    setToggling(true);
    try {
      await api.put('/settings', {
        isOrderingOpen: !currentState
      });
      alert(`Ordering window is now manually ${!currentState ? 'Opened' : 'Closed'}.`);
      fetchAdminStats();
    } catch (err) {
      alert(err.message || 'Settings override failed.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-screen-calc">
        <div className="spinner"></div>
      </div>
    );
  }

  const { orderingWindow, todayStats, grandTotalAmount, activeEmployeeCount } = data || {};
  const isOpen = orderingWindow?.isOpen;

  const getBeverageEmoji = (name) => {
    if (!name) return '🥛';
    const n = name.toLowerCase();
    if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  return (
    <div className="admin-dashboard-view">
      <header className="page-header flex-between">
        <div>
          <h1>Admin Control Panel 👋</h1>
          <p className="subtitle">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button className="btn btn-secondary btn-icon-round" onClick={fetchAdminStats} title="Refresh data">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-md" style={{ marginTop: '2rem' }}>
        {/* Core Controls */}
        <div className="card card-header-accent grid-colspan-2 flex-col-between">
          <div>
            <h3>System Status Override</h3>
            <p className="desc-text" style={{ marginTop: '0.25rem' }}>
              Override the automatic cutoff scheduling mechanism
            </p>
            <div className="system-status-indicators flex-between" style={{ marginTop: '1.5rem' }}>
              <div>
                <span className="status-label">Current Window Status:</span>
                <span className={`badge ${isOpen ? 'badge-success' : 'badge-error'}`} style={{ marginLeft: '0.5rem' }}>
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <span className="time-scheduled">
                Auto-Scheduled: {orderingWindow?.teaTimeStart} - {orderingWindow?.cutoffTime}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleToggleOrdering(isOpen)}
            className={`btn w-full override-btn ${isOpen ? 'btn-danger' : 'btn-accent'}`}
            disabled={toggling}
            style={{ marginTop: '1.5rem' }}
          >
            <Power size={16} />
            {isOpen ? 'Force Close Ordering' : 'Force Open Ordering'}
          </button>
        </div>

        {/* Quick Aggregates */}
        <div className="card flex-col-between bg-primary-grad">
          <div>
            <span className="agg-label">Grand Total Cost (Today)</span>
            <h2 className="agg-val">₹{Number(grandTotalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>Active Employees:</span>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{activeEmployeeCount || 0}</strong>
          </div>
        </div>
      </div>

      {/* Today's Quantities Section */}
      <section className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <h2>Today's Beverages Count</h2>
        <p className="section-subtitle">Real-time breakdown of ordered items</p>
        
        <div className="grid grid-cols-4 gap-md" style={{ marginTop: '1rem' }}>
          {todayStats && todayStats.length > 0 ? (
            todayStats.map((item, index) => (
              <div key={index} className="card count-card">
                <span className="count-emoji">{getBeverageEmoji(item.tea_name)}</span>
                <h4 className="count-name">{item.tea_name}</h4>
                <div className="count-qty-row flex-between">
                  <span>Quantity Ordered</span>
                  <strong>{item.total_qty} units</strong>
                </div>
                <div className="count-price-row flex-between">
                  <span>Total Cost</span>
                  <strong>₹{Number(item.total_amt).toFixed(0)}</strong>
                </div>
              </div>
            ))
          ) : (
            <div className="card grid-colspan-4 empty-counts">
              <ListOrdered size={36} style={{ color: 'var(--color-border)', marginBottom: '0.5rem' }} />
              <p>No orders have been submitted by employees yet today.</p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .grid-colspan-2 {
          grid-column: span 2 / span 2;
        }

        .grid-colspan-4 {
          grid-column: span 4 / span 4;
        }

        @media (max-width: 768px) {
          .grid-colspan-2, .grid-colspan-4 {
            grid-column: span 1 / span 1;
          }
        }

        .bg-primary-grad {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-color: var(--color-primary-hover);
          color: #ffffff;
        }

        .bg-primary-grad h2 {
          color: #ffffff;
        }

        .agg-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.85);
        }

        .agg-val {
          font-size: 2.25rem;
          font-family: var(--font-display);
          font-weight: 800;
          margin-top: 0.5rem;
          letter-spacing: -0.02em;
        }

        .status-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .time-scheduled {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .override-btn {
          height: 48px;
        }

        .count-card {
          text-align: center;
          padding: 1.5rem;
        }

        .count-emoji {
          font-size: 2.25rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .count-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .count-qty-row, .count-price-row {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          padding: 0.4rem 0;
          border-top: 1px solid var(--color-border);
        }

        .count-qty-row strong {
          color: var(--color-primary);
          font-size: 0.95rem;
        }

        .count-price-row strong {
          color: var(--color-text);
          font-size: 0.95rem;
        }

        .empty-counts {
          text-align: center;
          padding: 3rem 1.5rem;
          color: var(--color-text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
