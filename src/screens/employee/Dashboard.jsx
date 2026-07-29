import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RefreshCw, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setError('');
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickOrder = async (itemId) => {
    setSubmitting(true);
    try {
      const response = await api.post('/order', {
        teaItemId: itemId,
        quantity: 1
      });
      alert(response.data.message);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel your order for today?')) return;
    
    setSubmitting(true);
    try {
      const res = await api.put(`/order/${orderId}/cancel`);
      alert(res.data.message);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-screen-calc">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const { orderingWindow, teaItems, todayOrder, monthlyStats } = data || {};
  const isWindowOpen = orderingWindow?.isOpen;

  const getBeverageEmoji = (name) => {
    const n = name.toLowerCase();
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  return (
    <div className="dashboard-view">
      <header className="dashboard-header flex-between">
        <div>
          <h1>Hello, {user?.name} 👋</h1>
          <p className="subtitle">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button className="btn btn-secondary btn-icon-round" onClick={loadDashboardData} title="Refresh data">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={loadDashboardData}>Try Again</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-md" style={{ marginTop: '2rem' }}>
        {/* Ordering Window Status Card */}
        <div className={`card ${isWindowOpen ? 'window-open-card' : 'window-closed-card'}`}>
          <div className="status-badge-row">
            <span className={`pulse-dot ${isWindowOpen ? '' : 'closed'}`}></span>
            <h3>{isWindowOpen ? 'Tea Time is Open' : 'Ordering Closed'}</h3>
          </div>
          <p className="desc-text" style={{ marginTop: '0.5rem' }}>
            {isWindowOpen 
              ? 'Place your tea or coffee order now before the window closes!' 
              : 'The ordering submission window is currently closed.'}
          </p>
          <div className="schedule-box">
            <span>Daily Active Hours:</span>
            <strong>{orderingWindow?.teaTimeStart} - {orderingWindow?.cutoffTime}</strong>
          </div>
        </div>

        {/* Today's Order Details Card */}
        <div className="card card-header-accent">
          <h3>Today's Order Status</h3>
          {todayOrder ? (
            <div className="order-details-container" style={{ marginTop: '1rem' }}>
              <div className="order-main-info flex-between">
                <div>
                  <span className="order-emoji">{getBeverageEmoji(todayOrder.tea_name)}</span>
                  <span className="order-item-name">{todayOrder.tea_name}</span>
                </div>
                <span className={`badge ${todayOrder.status === 'ordered' ? 'badge-success' : 'badge-error'}`}>
                  {todayOrder.status}
                </span>
              </div>
              <div className="order-stats-row flex-between">
                <span>Quantity: {todayOrder.quantity}</span>
              </div>
              {todayOrder.status === 'ordered' && (
                <button 
                  className={`btn btn-danger w-full ${submitting ? 'btn-disabled' : ''}`}
                  onClick={() => handleCancelOrder(todayOrder.id)}
                  disabled={submitting}
                  style={{ marginTop: '1.25rem' }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          ) : (
            <div className="no-order-placeholder">
              <p>You haven't placed an order for today yet.</p>
              {isWindowOpen ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/order')}
                  style={{ marginTop: '1rem' }}
                >
                  Order Now
                </button>
              ) : (
                <span className="badge badge-muted" style={{ marginTop: '1rem' }}>Closed</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Order Shortcuts */}
      {isWindowOpen && !todayOrder && teaItems && teaItems.length > 0 && (
        <section className="dashboard-section">
          <h2>Quick Order</h2>
          <p className="section-subtitle">Place a 1-quantity order with a single click</p>
          <div className="grid grid-cols-4 gap-md" style={{ marginTop: '1rem' }}>
            {teaItems.map((item) => (
              <div 
                key={item.id} 
                className="card quick-order-card"
                onClick={() => !submitting && handleQuickOrder(item.id)}
              >
                <span className="item-emoji">{getBeverageEmoji(item.name)}</span>
                <h4 className="item-name">{item.name}</h4>
                <div className="quick-order-overlay">
                  <span>Order 1 Qty</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Aggregate Statistics */}
      <section className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <h2>This Month's Summary</h2>
        <div className="grid grid-cols-1 gap-md" style={{ marginTop: '1rem', maxWidth: '350px' }}>
          <div className="card stats-summary-card">
            <div className="card-icon-round primary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-label">Days Ordered</p>
              <h3 className="stat-value">{monthlyStats?.totalOrders || 0}</h3>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .h-screen-calc {
          height: calc(100vh - 80px);
        }
        
        .flex-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .dashboard-header h1 {
          font-size: 2rem;
          color: var(--color-text);
        }

        .dashboard-header .subtitle {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .btn-icon-round {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-banner {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-sm);
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid hsla(0, 72%, 50%, 0.1);
        }

        .window-open-card {
          border-color: var(--color-success);
          background: linear-gradient(135deg, var(--color-surface), hsla(142, 60%, 45%, 0.03));
        }

        .window-closed-card {
          border-color: var(--color-border);
          opacity: 0.95;
        }

        .status-badge-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .desc-text {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }

        .schedule-box {
          margin-top: 1.25rem;
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .schedule-box span {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .schedule-box strong {
          color: var(--color-primary);
        }

        .no-order-placeholder {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-secondary);
        }

        .order-emoji {
          font-size: 1.5rem;
          margin-right: 0.5rem;
        }

        .order-item-name {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .order-stats-row {
          margin-top: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .order-cost {
          font-size: 1.25rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .dashboard-section {
          margin-top: 2.5rem;
        }

        .dashboard-section h2 {
          font-size: 1.5rem;
          color: var(--color-text);
        }

        .section-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .quick-order-card {
          text-align: center;
          padding: 1.5rem 1rem;
          cursor: pointer;
          position: relative;
        }

        .item-emoji {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 700;
        }

        .item-price {
          color: var(--color-primary);
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .quick-order-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
          border-radius: var(--radius-md);
        }

        .quick-order-overlay span {
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quick-order-card:hover .quick-order-overlay {
          opacity: 1;
        }

        .stats-summary-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .card-icon-round {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon-round.primary {
          background-color: var(--color-primary-light);
          color: var(--color-primary);
        }

        .card-icon-round.accent {
          background-color: hsla(43, 85%, 52%, 0.1);
          color: var(--color-accent);
        }

        .card-icon-round.success {
          background-color: var(--color-success-bg);
          color: var(--color-success);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.5rem;
          color: var(--color-text);
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}
