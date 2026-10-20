import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Check, X, ShieldAlert, Trash2 } from 'lucide-react';

export default function TeaMaster() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [itemType, setItemType] = useState('drink');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalVisible) {
        setModalVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalVisible]);

  const fetchItems = async () => {
    try {
      const res = await api.get('/tea-items');
      setItems(res.data.teaItems || []);
    } catch (err) {
      alert(err.message || 'Failed to fetch tea items.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to remove "${itemName || 'this beverage'}" from the menu catalog?`)) {
      return;
    }

    try {
      const res = await api.delete(`/tea-items/${itemId}`);
      alert(res.data?.message || 'Beverage deleted successfully.');
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete beverage item.');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.put(`/tea-items/${item.id}`, {
        is_available: !item.is_available
      });
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to toggle beverage availability.');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setIsAvailable(true);
    setItemType('drink');
    setFormError('');
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setPrice(item.price !== undefined && item.price !== null ? item.price.toString() : '');
    setIsAvailable(Boolean(item.is_available));
    setItemType(item.item_type || 'drink');
    setFormError('');
    setModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || price === '' || isNaN(Number(price))) {
      setFormError('Please enter a valid beverage name and price.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/tea-items/${editingItem.id}`, {
          name: name.trim(),
          price: Number(price),
          is_available: isAvailable,
          item_type: itemType
        });
        setModalVisible(false);
        fetchItems();
        alert('Beverage updated successfully.');
      } else {
        await api.post('/tea-items', {
          name: name.trim(),
          price: Number(price),
          is_available: isAvailable,
          item_type: itemType
        });
        setModalVisible(false);
        fetchItems();
        alert('Beverage item created successfully.');
      }
    } catch (err) {
      setFormError(err.message || 'Beverage registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBeverageEmoji = (name) => {
    if (!name) return '🥛';
    const n = name.toLowerCase();
    if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  return (
    <div className="tea-master-view">
      <header className="page-header flex-between">
        <div>
          <h1>Beverage Master List</h1>
          <p className="subtitle">Configure afternoon tea/coffee offerings, prices, and availability</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Beverage
        </button>
      </header>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-md" style={{ marginTop: '2rem' }}>
          {items && items.length > 0 ? (
            items.map((item) => {
              return (
                <div key={item.id} className="card item-card-admin">
                  <div className="card-top flex-between">
                    <span className="beverage-emoji-admin">{getBeverageEmoji(item.name)}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className={`badge ${item.item_type === 'snack' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {item.item_type === 'snack' ? '🍪 Snack' : '🍵 Drink'}
                      </span>
                      <button
                        type="button"
                        className={`badge ${item.is_available ? 'badge-success' : 'badge-error'}`}
                        onClick={() => handleToggleAvailability(item)}
                        title={`Click to mark as ${item.is_available ? 'Unavailable' : 'Available'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {item.is_available ? '● Available' : '○ Unavailable'}
                      </button>
                    </div>
                  </div>

                  <h3 className="beverage-title-admin" style={{ marginTop: '1.25rem' }}>{item.name}</h3>
                  <p className="beverage-price-admin">₹{Number(item.price).toFixed(2)}</p>

                  <div className="beverage-actions-admin" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleOpenEdit(item)}
                      style={{ padding: '0.5rem 1rem', flex: 1 }}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger-outline"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      style={{ padding: '0.5rem 1rem', flex: 1 }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card grid-colspan-3 empty-counts" style={{ padding: '4rem' }}>
              <p>No beverages registered in the TeaMaster directory yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Beverage Modal */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content card card-header-accent" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-x" 
              onClick={() => setModalVisible(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <h3>{editingItem ? 'Edit Beverage Details' : 'Register New Beverage'}</h3>
            <p className="desc-text" style={{ marginBottom: '1.25rem' }}>
              Modify tea or coffee properties, daily costs, and menu catalog states
            </p>

            {formError && (
              <div className="form-error-banner" style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldAlert size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="bev-name">Beverage Name *</label>
                <input
                  id="bev-name"
                  type="text"
                  placeholder="e.g. Cardamom Tea, Cappuccino..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bev-price">Price (INR) *</label>
                <input
                  id="bev-price"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Item Type *</label>
                <div className="type-toggle-group">
                  <button
                    type="button"
                    className={`type-toggle-btn ${itemType === 'drink' ? 'active' : ''}`}
                    onClick={() => setItemType('drink')}
                  >
                    🍵 Drink
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-btn ${itemType === 'snack' ? 'active' : ''}`}
                    onClick={() => setItemType('snack')}
                  >
                    🍪 Snack
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem', display: 'block' }}>
                  {itemType === 'drink' ? '* Drink items will show Sugar preference during ordering' : '* Snack items skip sugar preference'}
                </span>
              </div>

              <div className="form-group flex-between" style={{ flexDirection: 'row', padding: '0.5rem 0' }}>
                <label htmlFor="bev-available" style={{ cursor: 'pointer' }}>Available on Daily Menu</label>
                <label className="switch-toggle">
                  <input 
                    id="bev-available" 
                    type="checkbox" 
                    checked={isAvailable} 
                    onChange={(e) => setIsAvailable(e.target.checked)} 
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingItem ? 'Saving Changes...' : 'Registering...') : (editingItem ? 'Save Changes' : 'Register Beverage')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .item-card-admin {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .beverage-emoji-admin {
          font-size: 2.5rem;
        }

        .beverage-title-admin {
          font-size: 1.25rem;
          color: var(--color-text);
          font-weight: 700;
        }

        .beverage-price-admin {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary);
          font-family: var(--font-display);
          margin-top: 0.25rem;
        }

        .btn-danger-outline {
          background-color: transparent;
          border: 1px solid var(--color-error);
          color: var(--color-error);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .btn-danger-outline:hover {
          background-color: var(--color-error-bg);
        }

        .type-toggle-group {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .type-toggle-btn {
          flex: 1;
          padding: 0.6rem 1rem;
          border-radius: var(--radius-sm);
          border: 2px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .type-toggle-btn.active {
          border-color: var(--color-primary);
          background-color: var(--color-primary-light);
          color: var(--color-primary);
        }

        .type-toggle-btn:hover:not(.active) {
          border-color: var(--color-text-secondary);
          background-color: var(--color-background);
        }

        .badge-warning {
          background-color: hsla(38, 92%, 50%, 0.12);
          color: hsl(38, 80%, 40%);
          border: 1px solid hsla(38, 92%, 50%, 0.25);
        }

        .badge-info {
          background-color: hsla(210, 80%, 50%, 0.10);
          color: hsl(210, 70%, 45%);
          border: 1px solid hsla(210, 80%, 50%, 0.20);
        }

        .modal-content {
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-close-x {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 20;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .modal-close-x:hover {
          background-color: var(--color-surface-hover);
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
