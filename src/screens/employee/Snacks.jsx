import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Cookie, Info, CheckCircle2, ShieldCheck, RefreshCw, XCircle, User, Users } from 'lucide-react';
import { formatOrderTimeOnly } from '../../utils/dateUtils';

export default function Snacks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeSharedOrder, setActiveSharedOrder] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [availableSnacks, setAvailableSnacks] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [windowInfo, setWindowInfo] = useState({ isOpen: false, start: '', cutoff: '' });

  // Selection form states
  const [selectedSnack, setSelectedSnack] = useState(null);
  const [selectedColleagueId, setSelectedColleagueId] = useState('');

  const loadSnackData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch active shared snack for today
      const activeRes = await api.get('/shared-snacks/active');
      if (activeRes.data.hasActiveOrder) {
        setActiveSharedOrder(activeRes.data.order);
        setIsInitiator(activeRes.data.isInitiator);
      } else {
        setActiveSharedOrder(null);
        setIsInitiator(false);
      }

      // 2. Fetch available snacks (dynamically from admin-controlled catalog)
      const snacksRes = await api.get('/shared-snacks/available');
      const snackList = snacksRes.data.snacks || [];
      setAvailableSnacks(snackList);
      if (snackList.length > 0 && !selectedSnack) {
        setSelectedSnack(snackList[0]);
      }

      // 3. Fetch colleagues
      const colleaguesRes = await api.get('/shared-snacks/colleagues');
      const colleagueList = colleaguesRes.data.colleagues || [];
      setColleagues(colleagueList);
      if (colleagueList.length > 0) {
        if (!selectedColleagueId || !colleagueList.some(c => c.id.toString() === selectedColleagueId)) {
          setSelectedColleagueId(colleagueList[0].id.toString());
        }
      } else {
        setSelectedColleagueId('');
        // No colleagues available
      }

      // 4. Fetch ordering window info from dashboard
      const dashRes = await api.get('/dashboard');
      if (dashRes.data.orderingWindow) {
        setWindowInfo({
          isOpen: dashRes.data.orderingWindow.isOpen,
          start: dashRes.data.orderingWindow.teaTimeStart,
          cutoff: dashRes.data.orderingWindow.cutoffTime
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load snacks data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnackData();
  }, []);

  const isSoloMode = colleagues.length === 0;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!windowInfo.isOpen) {
      alert('Ordering is currently closed.');
      return;
    }
    if (!selectedSnack) {
      alert('Please select a colleague item / snack.');
      return;
    }

    if (!isSoloMode && !selectedColleagueId) {
      alert('Please select a colleague to share with.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/shared-snacks', {
        teaItemId: selectedSnack.id,
        orderMode: isSoloMode ? 'self' : 'share',
        sharedWithUserId: isSoloMode ? null : parseInt(selectedColleagueId, 10),
        additionalQuantity: 0
      });
      setSuccessMsg(res.data.message);
      loadSnackData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to place snack order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSharedOrder = async (orderId) => {
    const isSolo = activeSharedOrder?.isSelf || !activeSharedOrder?.shared_user_id;
    const confirmMsg = isSolo 
      ? 'Are you sure you want to cancel your snack order for today?' 
      : 'Are you sure you want to cancel this shared snack order for today?';
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/shared-snacks/${orderId}/cancel`);
      alert(res.data.message);
      loadSnackData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to cancel order.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSnackEmoji = (name) => {
    if (!name) return '🍪';
    const n = name.toLowerCase();
    if (n.includes('milk')) return '🥛🍪';
    if (n.includes('oreo')) return '🍫🍪';
    if (n.includes('bourbon')) return '🍪';
    if (n.includes('good day')) return '🍪';
    if (n.includes('salt')) return '🥨';
    return '🍪';
  };

  if (loading) {
    return (
      <div className="flex-center h-screen-calc">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Loading snacks...
        </p>
      </div>
    );
  }

  const isSoloOrder = activeSharedOrder?.isSelf || !activeSharedOrder?.shared_user_id;

  return (
    <div className="snacks-view">
      <header className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '2rem' }}>👥</span>
            <h1>Colleague Items & Shared Snacks</h1>
          </div>
          <p className="subtitle">
            Select and share afternoon snacks or dedicated colleague items with your coworker
          </p>
        </div>
        <button className="btn btn-secondary btn-icon-round" onClick={loadSnackData} title="Refresh snacks">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="alert-card" style={{ backgroundColor: 'hsla(142, 70%, 45%, 0.1)', borderColor: 'hsl(142, 70%, 45%)', color: 'hsl(142, 60%, 35%)', marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={20} />
          <p style={{ margin: 0, fontWeight: 600 }}>{successMsg}</p>
        </div>
      )}

      {!windowInfo.isOpen && (
        <div className="alert-card closed-alert" style={{ marginTop: '1.5rem' }}>
          <Info size={20} />
          <div>
            <h4>Ordering window is currently closed</h4>
            <p>
              Ordering window runs from <strong>{windowInfo.start}</strong> to <strong>{windowInfo.cutoff}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* CASE 1: ACTIVE SNACK ORDER EXISTS */}
      {activeSharedOrder ? (
        <div className="active-order-section" style={{ marginTop: '2rem' }}>
          <div className="card active-shared-card">
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="snack-icon-large">{getSnackEmoji(activeSharedOrder.snack_name)}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeSharedOrder.snack_name}</h2>
                    <span className="badge badge-success" style={{ fontWeight: 700 }}>
                      ✓ {activeSharedOrder.status.toUpperCase()}
                    </span>
                    <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: 700 }}>
                      {isSoloOrder ? 'Solo Order (1 Qty)' : 'Shared Session Order (1 Qty)'}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Placed at {activeSharedOrder.created_at ? formatOrderTimeOnly(activeSharedOrder.created_at) : 'Today'}
                  </p>
                </div>
              </div>

              {isInitiator && activeSharedOrder.status === 'ordered' && windowInfo.isOpen && (
                <button
                  className={`btn btn-danger btn-sm ${submitting ? 'btn-disabled' : ''}`}
                  onClick={() => handleCancelSharedOrder(activeSharedOrder.id)}
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <XCircle size={16} />
                  {isSoloOrder ? 'Cancel Snack Order' : 'Cancel Shared Order'}
                </button>
              )}
            </div>

            {/* Recipient / Initiator / Solo Greeting Banner */}
            {isSoloOrder ? (
              <div className="shared-initiator-alert" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '8px', backgroundColor: 'hsla(142, 70%, 45%, 0.12)', border: '1px solid hsl(142, 70%, 45%)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>👤</span>
                <div>
                  <h4 style={{ margin: 0, color: 'hsl(142, 60%, 35%)', fontWeight: 700 }}>
                    You ordered this snack for yourself (Solo - 1 Qty)
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    Your snack order is confirmed for today's TeaTime session.
                  </p>
                </div>
              </div>
            ) : !isInitiator ? (
              <div className="shared-recipient-alert" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '8px', backgroundColor: 'hsla(217, 91%, 60%, 0.12)', border: '1px solid hsl(217, 91%, 60%)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎁</span>
                <div>
                  <h4 style={{ margin: 0, color: 'hsl(217, 91%, 45%)', fontWeight: 700 }}>
                    {activeSharedOrder.primary_user_name} has shared this snack order with you!
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    Your tea order and this shared snack order are both confirmed for today's TeaTime session.
                  </p>
                </div>
              </div>
            ) : (
              <div className="shared-initiator-alert" style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', borderRadius: '8px', backgroundColor: 'hsla(142, 70%, 45%, 0.12)', border: '1px solid hsl(142, 70%, 45%)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🤝</span>
                <div>
                  <h4 style={{ margin: 0, color: 'hsl(142, 60%, 35%)', fontWeight: 700 }}>
                    You initiated this shared snack order with {activeSharedOrder.shared_user_name}
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    Single shared order maintained for today's session.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CASE 2: NO ACTIVE ORDER YET - ORDER FORM */
        <div className="order-container grid grid-cols-2 gap-lg" style={{ marginTop: '2rem' }}>
          {/* Left Column: Colleague Item Selection */}
          <div className="menu-selection-section">
            <h3>1. Select Colleague Item</h3>

            <div className="menu-list" style={{ marginTop: '1rem' }}>
              {availableSnacks && availableSnacks.length > 0 ? (
                availableSnacks.map((snack) => {
                  const isSelected = selectedSnack?.id === snack.id;
                  return (
                    <div
                      key={snack.id}
                      className={`menu-item-row card ${isSelected ? 'selected' : ''}`}
                      onClick={() => windowInfo.isOpen && setSelectedSnack(snack)}
                      style={{ cursor: windowInfo.isOpen ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={`custom-radio-indicator ${isSelected ? 'selected' : ''}`} />
                          <span className="item-row-emoji">{getSnackEmoji(snack.name)}</span>
                          <div>
                            <h4 className="item-row-name">{snack.name}</h4>
                            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', alignItems: 'center' }}>
                              <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                                👥 Colleague Item
                              </span>
                              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="item-row-price">₹{Number(snack.price).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-items-text">No colleague items available today.</p>
              )}
            </div>
          </div>

          {/* Right Column: Order Form */}
          <div className="order-summary-panel">
            <div className="card card-header-accent summary-card-full">
              <h3>{isSoloMode ? '2. Order for Myself' : '2. Share with Colleague'}</h3>

              <form onSubmit={handlePlaceOrder} style={{ marginTop: '1.25rem' }}>
                {!isSoloMode ? (
                  /* When colleagues exist: ONLY Colleague Dropdown is shown */
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                      Select Colleague (Employee 2)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="form-control"
                        value={selectedColleagueId}
                        onChange={(e) => setSelectedColleagueId(e.target.value)}
                        disabled={!windowInfo.isOpen}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-background)',
                          color: 'var(--color-text)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {colleagues.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* When NO colleagues available (empty list): Order for Myself shown */
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '8px', backgroundColor: 'hsla(38, 92%, 50%, 0.12)', border: '1px solid hsla(38, 92%, 50%, 0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Info size={20} color="hsl(38, 80%, 40%)" />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'hsl(38, 80%, 35%)' }}>
                          No colleagues available to share
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          All other employees have already placed snack orders today. You can place an order directly for yourself!
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>👤</span>
                        <strong style={{ color: 'var(--color-text)' }}>Solo Snack Order (1 Qty)</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Item: <strong>{selectedSnack ? selectedSnack.name : 'Selected Item'}</strong> • Qty: <strong>1</strong> • Amount: <strong>₹{selectedSnack ? Number(selectedSnack.price).toFixed(2) : '0.00'}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary w-full order-submit-btn ${(!windowInfo.isOpen || submitting || !selectedSnack || (!isSoloMode && !selectedColleagueId)) ? 'btn-disabled' : ''}`}
                  disabled={!windowInfo.isOpen || submitting || !selectedSnack || (!isSoloMode && !selectedColleagueId)}
                  style={{ height: '52px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}
                >
                  <Cookie size={20} />
                  {submitting 
                    ? 'Placing Order...' 
                    : isSoloMode 
                      ? 'Place Snack Order for Myself' 
                      : 'Share & Place Snack Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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

        .closed-alert {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid hsla(0, 72%, 50%, 0.15);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .closed-alert h4 {
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .closed-alert p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .snack-icon-large {
          font-size: 2.5rem;
        }

        .active-shared-card {
          padding: 2rem;
        }

        .menu-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .menu-item-row {
          padding: 1.25rem;
          transition: all var(--transition-fast);
        }

        .menu-item-row.selected {
          border-color: var(--color-primary);
          background-color: var(--color-primary-light);
        }

        .item-row-emoji {
          font-size: 2rem;
        }

        .item-row-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .item-row-price {
          font-weight: 700;
          color: var(--color-primary);
          font-size: 1.1rem;
        }

        .custom-radio-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        
        .custom-radio-indicator::after {
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--color-primary);
          transform: scale(0);
          transition: transform var(--transition-fast);
        }
        
        .custom-radio-indicator.selected {
          border-color: var(--color-primary);
        }
        
        .custom-radio-indicator.selected::after {
          transform: scale(1);
        }

        .summary-card-full {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .badge-purple {
          background-color: hsla(265, 89%, 66%, 0.14);
          color: #7c3aed;
          border: 1px solid hsla(265, 89%, 66%, 0.35);
          font-weight: 600;
        }

        .badge-warning {
          background-color: hsla(38, 92%, 50%, 0.12);
          color: hsl(38, 80%, 40%);
          border: 1px solid hsla(38, 92%, 50%, 0.25);
        }
      `}</style>
    </div>
  );
}
