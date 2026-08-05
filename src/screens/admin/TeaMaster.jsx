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

  const fetchItems = async () => {
    try {
      const res = await api.get('/tea-items');
      setItems(res.data.teaItems);
    } catch (err) {
      alert(err.message || 'Failed to fetch tea items.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this beverage item? This will remove it from the menu catalog.')) {
      return;
    }

    try {
      const res = await api.delete(`/tea-items/${itemId}`);
      alert(res.data.message || 'Beverage deleted successfully.');
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete beverage item.');
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
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setIsAvailable(item.is_available);
    setItemType(item.item_type || 'drink');
    setModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || isNaN(Number(price))) {
      alert('Please enter a valid beverage name and price.');
      return;
    }

    try {
      if (editingItem) {
        await api.put(`/tea-items/${editingItem.id}`, {
          name,
          price: Number(price),
          is_available: isAvailable,
          item_type: itemType
        });
        alert('Beverage updated successfully.');
      } else {
        await api.post('/tea-items', {
          name,
          price: Number(price),
          is_available: isAvailable,
          item_type: itemType
        });
        alert('Beverage item created successfully.');
      }
      setModalVisible(false);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Beverage registration failed.');
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
                      <span className={`badge ${item.is_available ? 'badge-success' : 'badge-error'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
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
                      onClick={() => handleDeleteItem(item.id)}
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
        <div className="modal-overlay">
          <div className="modal-content card card-header-accent">
            <button className="modal-close-x" onClick={() => setModalVisible(false)}>
              <X size={20} />
            </button>
            <h3>{editingItem ? 'Edit Beverage Details' : 'Register New Beverage'}</h3>
            <p className="desc-text" style={{ marginBottom: '1.5rem' }}>
              Modify tea or coffee properties, daily costs, and menu catalog states
            </p>

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
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Register Beverage'}
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
      `}</style>
    </div>
  );
}
