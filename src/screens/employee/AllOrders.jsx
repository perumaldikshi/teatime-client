import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RefreshCw, Search, Users, ShieldAlert, ArrowLeft, Coffee } from 'lucide-react';
import { formatOrderTimeOnly } from '../../utils/dateUtils';

export default function AllOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchTodayOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/today-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch today orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const getBeverageEmoji = (name) => {
    if (!name) return '🥛';
    const n = name.toLowerCase();
    if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  // If user does not have permission
  if (!user?.can_view_all_orders && user?.role !== 'admin') {
    return (
      <div className="all-orders-view" style={{ padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
          <ShieldAlert size={48} style={{ color: 'var(--color-error)', margin: '0 auto 1rem auto' }} />
          <h2>Access Restricted</h2>
          <p className="desc-text" style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
            You do not have permission to view other employees' orders. Please contact an Administrator to enable distribution access for your account.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/')}
            style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const emp = (o.employee_name || '').toLowerCase();
    const tea = (o.tea_name || '').toLowerCase();
    const dept = (o.department || '').toLowerCase();
    return emp.includes(q) || tea.includes(q) || dept.includes(q);
  });

  // Calculate quick item counts
  const itemCounts = {};
  let totalPaper = 0;
  let totalGlass = 0;
  orders.forEach(o => {
    itemCounts[o.tea_name] = (itemCounts[o.tea_name] || 0) + Number(o.quantity || 1);
    if (o.cup_type === 'paper') totalPaper += Number(o.quantity || 1);
    if (o.cup_type === 'glass') totalGlass += Number(o.quantity || 1);
  });

  return (
    <div className="all-orders-view">
      <header className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-icon-round" onClick={() => navigate('/')} title="Back" style={{ width: '36px', height: '36px' }}>
              <ArrowLeft size={16} />
            </button>
            <h1>Today's Employee Orders 🍵</h1>
          </div>
    
        </div>
        <button className="btn btn-secondary btn-icon-round" onClick={fetchTodayOrders} title="Refresh data">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      {/* Beverage Breakdown Summary Pills */}
      <div className="card summary-pills-card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.75rem' }}>
          Today's Total Preparation Summary
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {Object.entries(itemCounts).map(([name, count]) => (
            <div key={name} className="item-count-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>{getBeverageEmoji(name)}</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{name}:</strong>
              <span className="badge badge-primary" style={{ fontWeight: 800 }}>{count}</span>
            </div>
          ))}

          {(totalPaper > 0 || totalGlass > 0) && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {totalPaper > 0 && (
                <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '0.4rem 0.75rem' }}>
                  🥤 {totalPaper} Paper Cups
                </span>
              )}
              {totalGlass > 0 && (
                <span className="badge" style={{ backgroundColor: 'hsla(200, 70%, 50%, 0.12)', color: 'hsl(200, 70%, 45%)', border: '1px solid hsl(200, 70%, 45%)', padding: '0.4rem 0.75rem' }}>
                  🥛 {totalGlass} Glass Cups
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="toolbar card" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 600 }}>Total Orders Today: <strong>{orders.length}</strong></span>
        </div>

        <div className="search-box-compact" style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search employee or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: '38px', padding: '0 1rem 0 2.2rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Employee Name</th>
                  <th style={{ width: '32%' }}>Item Ordered</th>
                  <th style={{ width: '24%' }}>Cup & Sugar Preference</th>
                  <th style={{ width: '14%', textAlign: 'center' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {(order.employee_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-text)' }}>
                              {order.employee_name || 'System User'}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {order.department || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>{getBeverageEmoji(order.tea_name)}</span>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--color-text)', display: 'block' }}>
                              {order.tea_name}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              Ordered at: {order.created_at ? formatOrderTimeOnly(order.created_at) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {order.item_type === 'drink' ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {order.cup_type && (
                              <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontSize: '0.72rem', fontWeight: 700 }}>
                                {order.cup_type === 'paper' ? '🥤 Paper Cup' : '🥛 Glass Cup'}
                              </span>
                            )}
                            <span className="badge" style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: order.sugar_preference === 'with_sugar' ? 'hsla(142, 70%, 42%, 0.10)' : 'hsla(0, 70%, 55%, 0.08)',
                              color: order.sugar_preference === 'with_sugar' ? 'hsl(142, 60%, 35%)' : 'hsl(0, 60%, 45%)',
                              border: order.sugar_preference === 'with_sugar' ? '1px solid hsla(142, 70%, 42%, 0.25)' : '1px solid hsla(0, 70%, 55%, 0.20)'
                            }}>
                              {order.sugar_preference === 'with_sugar' ? '🍬 With Sugar' : '🚫 No Sugar'}
                            </span>
                          </div>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>🍪 Snack Item</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.9rem', fontWeight: 700, padding: '0.35rem 0.8rem', borderRadius: '6px' }}>
                          {order.quantity} {order.quantity > 1 ? 'cups' : 'cup'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-data" style={{ textAlign: 'center', padding: '3rem' }}>
                      {search ? 'No orders match your search criteria.' : 'No orders have been submitted by employees yet today.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

