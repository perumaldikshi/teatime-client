import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RefreshCw, ShieldAlert, ArrowLeft, Coffee, Users } from 'lucide-react';

export default function AllOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (n.includes('biscuit') || n.includes('cookie') || n.includes('oreo')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    if (n.includes('horlicks') || n.includes('boost') || n.includes('milk')) return '🥛';
    return '☕';
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

  // Calculate detailed preparation counts
  const commonItemsMap = {};
  const colleagueItemsMap = {};
  let totalCommonCount = 0;
  let totalColleagueCount = 0;
  let totalPaper = 0;
  let totalGlass = 0;
  let totalWithSugar = 0;
  let totalWithoutSugar = 0;

  orders.forEach(o => {
    const qty = Number(o.quantity || 1);
    const isColleague = o.is_colleague_item || o.is_shared || o.category === 'colleague';

    if (isColleague) {
      // ONLY genuine colleague items
      totalColleagueCount += qty;
      if (!colleagueItemsMap[o.tea_name]) {
        colleagueItemsMap[o.tea_name] = {
          name: o.tea_name,
          quantity: 0
        };
      }
      colleagueItemsMap[o.tea_name].quantity += qty;
    } else {
      // ALL COMMON ITEMS (Drinks + Common snacks if any)
      totalCommonCount += qty;
      if (!commonItemsMap[o.tea_name]) {
        commonItemsMap[o.tea_name] = {
          name: o.tea_name,
          quantity: 0,
          itemType: o.item_type || 'drink',
          withSugar: 0,
          withoutSugar: 0,
          paper: 0,
          glass: 0
        };
      }
      commonItemsMap[o.tea_name].quantity += qty;

      if (o.sugar_preference === 'with_sugar') {
        commonItemsMap[o.tea_name].withSugar += qty;
        totalWithSugar += qty;
      } else if (o.sugar_preference === 'without_sugar') {
        commonItemsMap[o.tea_name].withoutSugar += qty;
        totalWithoutSugar += qty;
      }

      if (o.cup_type === 'paper') {
        commonItemsMap[o.tea_name].paper += qty;
        totalPaper += qty;
      } else if (o.cup_type === 'glass') {
        commonItemsMap[o.tea_name].glass += qty;
        totalGlass += qty;
      }
    }
  });

  const commonItemsList = Object.values(commonItemsMap).sort((a, b) => b.quantity - a.quantity);
  const colleagueItemsList = Object.values(colleagueItemsMap).sort((a, b) => b.quantity - a.quantity);
  const totalItems = totalCommonCount + totalColleagueCount;

  return (
    <div className="all-orders-view">
      <header className="page-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="btn btn-secondary btn-icon-round" onClick={() => navigate('/')} title="Back" style={{ width: '36px', height: '36px' }}>
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: '1.8rem' }}>🍵</span>
            <h1 style={{ margin: 0 }}>Today's Total Preparation Summary</h1>
          </div>
          <p className="subtitle" style={{ marginLeft: '46px', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
            Consolidated beverage and colleague item counts required for today's session
          </p>
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

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading summary...</p>
        </div>
      ) : totalItems === 0 ? (
        <div className="card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center' }}>
          <Coffee size={40} style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }} />
          <h3>No Orders Placed Yet Today</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            When employees place beverage or colleague item orders, the total preparation counts will appear here.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Items to Prepare
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.35rem 0 0 0', color: 'var(--color-primary)', fontWeight: 800 }}>
                {totalItems}
              </h2>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(142, 70%, 45%)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Common Items / Drinks
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.35rem 0 0 0', color: 'hsl(142, 60%, 40%)', fontWeight: 800 }}>
                {totalCommonCount} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>items</span>
              </h2>
            </div>

            {totalColleagueCount > 0 && (
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #7c3aed' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Colleague Items
                </span>
                <h2 style={{ fontSize: '1.8rem', margin: '0.35rem 0 0 0', color: '#7c3aed', fontWeight: 800 }}>
                  {totalColleagueCount} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>items</span>
                </h2>
              </div>
            )}

            {(totalPaper > 0 || totalGlass > 0) && (
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(200, 70%, 50%)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Cups Required
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                  {totalPaper > 0 && (
                    <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                      🥤 {totalPaper} Paper
                    </span>
                  )}
                  {totalGlass > 0 && (
                    <span className="badge" style={{ backgroundColor: 'hsla(200, 70%, 50%, 0.12)', color: 'hsl(200, 70%, 45%)', fontWeight: 700, fontSize: '0.85rem' }}>
                      🥛 {totalGlass} Glass
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ALL COMMON ITEMS: Beverages Preparation Breakdown */}
          {commonItemsList.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <Coffee size={22} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Beverages Preparation Breakdown (All Common Items)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {commonItemsList.map(item => {
                  const isDrink = item.itemType === 'drink';
                  return (
                    <div 
                      key={item.name} 
                      style={{ 
                        padding: '1.25rem', 
                        borderRadius: '10px', 
                        backgroundColor: 'var(--color-background)', 
                        border: '1px solid var(--color-border)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between' 
                      }}
                    >
                      <div className="flex-between" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '2rem', flexShrink: 0 }}>{getBeverageEmoji(item.name)}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4 style={{ 
                              margin: 0, 
                              fontSize: '1.1rem', 
                              color: 'var(--color-text)', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}>
                              {item.name}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {isDrink ? 'Drink Item' : 'Common Item'}
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-primary" style={{ fontSize: '1.1rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {item.quantity} {isDrink ? (item.quantity > 1 ? 'cups' : 'cup') : (item.quantity > 1 ? 'items' : 'item')}
                        </span>
                      </div>

                      {/* Sugar & Cup Breakdown (for drinks) */}
                      {(item.withSugar > 0 || item.withoutSugar > 0 || item.paper > 0 || item.glass > 0) && (
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {item.withSugar > 0 && (
                            <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'hsla(142, 70%, 42%, 0.12)', color: 'hsl(142, 60%, 35%)', border: '1px solid hsla(142, 70%, 42%, 0.25)', whiteSpace: 'nowrap' }}>
                              🍬 With Sugar: {item.withSugar}
                            </span>
                          )}
                          {item.withoutSugar > 0 && (
                            <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'hsla(0, 70%, 55%, 0.1)', color: 'hsl(0, 60%, 45%)', border: '1px solid hsla(0, 70%, 55%, 0.2)', whiteSpace: 'nowrap' }}>
                              🚫 No Sugar: {item.withoutSugar}
                            </span>
                          )}
                          {item.paper > 0 && (
                            <span className="badge" style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
                              🥤 Paper: {item.paper}
                            </span>
                          )}
                          {item.glass > 0 && (
                            <span className="badge" style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>
                              🥛 Glass: {item.glass}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colleague Items Section (ONLY Colleague Items shown here) */}
          {colleagueItemsList.length > 0 && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <Users size={22} style={{ color: '#7c3aed' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Colleague Items to Distribute</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {colleagueItemsList.map(item => (
                  <div 
                    key={item.name} 
                    style={{ 
                      padding: '1.2rem 1.4rem', 
                      borderRadius: '12px', 
                      backgroundColor: 'var(--color-background)', 
                      border: '1px solid var(--color-border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    {/* Left: Icon and Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '10px', 
                        backgroundColor: 'hsla(265, 89%, 66%, 0.12)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '1.6rem',
                        flexShrink: 0
                      }}>
                        {getBeverageEmoji(item.name)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '1.05rem', 
                          fontWeight: 700, 
                          color: 'var(--color-text)', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {item.name}
                        </h4>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.3rem', 
                          marginTop: '0.3rem', 
                          padding: '0.2rem 0.55rem', 
                          borderRadius: '4px', 
                          backgroundColor: 'hsla(265, 89%, 66%, 0.14)', 
                          color: '#7c3aed', 
                          border: '1px solid hsla(265, 89%, 66%, 0.35)', 
                          fontSize: '0.72rem', 
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}>
                          👥 Colleague Item
                        </span>
                      </div>
                    </div>

                    {/* Right: Quantity Badge - Never wraps */}
                    <div style={{
                      flexShrink: 0,
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      backgroundColor: 'hsla(265, 89%, 66%, 0.16)',
                      border: '1px solid hsla(265, 89%, 66%, 0.38)',
                      color: '#7c3aed',
                      fontWeight: 800,
                      fontSize: '1rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span>{item.quantity}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.9 }}>
                        {item.quantity > 1 ? 'Items' : 'Item'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
