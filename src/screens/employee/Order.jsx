import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Minus, Plus, ShoppingCart, Info } from 'lucide-react';

export default function Order() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const quantity = 1;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      if (res.data.teaItems && res.data.teaItems.length > 0) {
        setSelectedItem(res.data.teaItems[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select a tea/coffee item');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/order', {
        teaItemId: selectedItem.id,
        quantity: quantity
      });
      alert(response.data.message);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Order execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-screen-calc">
        <div className="spinner"></div>
      </div>
    );
  }

  const { orderingWindow, teaItems } = data || {};
  const isWindowOpen = orderingWindow?.isOpen;

  const getBeverageEmoji = (name) => {
    const n = name.toLowerCase();
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  return (
    <div className="order-view">
      <header className="page-header">
        <h1>Order Your Drink</h1>
        <p className="subtitle">Choose your afternoon beverage and customize quantity</p>
      </header>

      {error && (
        <div className="error-banner" style={{ marginTop: '1.5rem' }}>
          <p>{error}</p>
        </div>
      )}

      {!isWindowOpen && (
        <div className="alert-card closed-alert">
          <Info size={20} />
          <div>
            <h4>Ordering is currently closed</h4>
            <p>
              Daily Ordering window is active from <strong>{orderingWindow?.teaTimeStart}</strong> to <strong>{orderingWindow?.cutoffTime}</strong>. 
              Orders can only be submitted or altered during this time.
            </p>
          </div>
        </div>
      )}

      <div className="order-container grid grid-cols-2 gap-lg" style={{ marginTop: '2rem' }}>
        {/* Item Selection List */}
        <div className="menu-selection-section">
          <h3>Menu Items</h3>
          <div className="menu-list" style={{ marginTop: '1rem' }}>
            {teaItems && teaItems.length > 0 ? (
              teaItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`menu-item-row card ${isSelected ? 'selected' : ''}`}
                    onClick={() => isWindowOpen && setSelectedItem(item)}
                    style={{ cursor: isWindowOpen ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={`custom-radio-indicator ${isSelected ? 'selected' : ''}`} />
                        <span className="item-row-emoji">{getBeverageEmoji(item.name)}</span>
                        <div>
                          <h4 className="item-row-name">{item.name}</h4>
                          <span className={`badge ${item.is_available !== false ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            {item.is_available !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-items-text">No beverages are available today.</p>
            )}
          </div>
        </div>

        {/* Customization and Summary Card */}
        <div className="order-summary-panel">
          <div className="card card-header-accent summary-card-full">
            <h3>Order Details</h3>
            
            {selectedItem ? (
              <form onSubmit={handleOrderSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="summary-beverage-detail flex-between">
                  <div>
                    <span className="summary-emoji">{getBeverageEmoji(selectedItem.name)}</span>
                    <span className="summary-name">{selectedItem.name}</span>
                  </div>
                </div>

                <div className="quantity-selector-container">
                  <label>Quantity (Fixed)</label>
                  <div className="quantity-controls">
                    <button 
                      type="button" 
                      disabled={true}
                      className="quantity-btn"
                      style={{ cursor: 'not-allowed', opacity: 0.5 }}
                      title="Quantity is fixed to 1"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">1</span>
                    <button 
                      type="button" 
                      disabled={true}
                      className="quantity-btn"
                      style={{ cursor: 'not-allowed', opacity: 0.5 }}
                      title="Quantity is fixed to 1"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                    * Quantity is read-only (1 per order)
                  </span>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full order-submit-btn ${(!isWindowOpen || submitting) ? 'btn-disabled' : ''}`}
                  disabled={!isWindowOpen || submitting}
                  style={{ marginTop: '2rem' }}
                >
                  <ShoppingCart size={18} />
                  {submitting ? 'Submitting Order...' : 'Place Order'}
                </button>
              </form>
            ) : (
              <p className="no-items-text" style={{ padding: '2rem 0' }}>Select a beverage from the menu to configure your order.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .closed-alert {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid hsla(0, 72%, 50%, 0.15);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-top: 1.5rem;
        }

        .closed-alert h4 {
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .closed-alert p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
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

        .summary-card-full {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .summary-beverage-detail {
          background-color: var(--color-background);
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }

        .summary-emoji {
          font-size: 1.5rem;
          margin-right: 0.5rem;
          vertical-align: middle;
        }

        .summary-name {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .summary-price {
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .quantity-selector-container {
          margin-top: 2rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .quantity-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0;
        }

        .quantity-btn:hover:not(:disabled) {
          border-color: var(--color-primary);
          background-color: var(--color-primary-light);
          color: var(--color-primary);
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-value {
          font-size: 1.5rem;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
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

        .divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 2rem 0;
        }

        .total-calculation {
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .total-value {
          font-size: 2rem;
          color: var(--color-primary);
          font-weight: 800;
          font-family: var(--font-display);
        }

        .order-submit-btn {
          height: 52px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
