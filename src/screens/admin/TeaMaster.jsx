import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Check, X, ShieldAlert } from 'lucide-react';

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

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setIsAvailable(true);
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setIsAvailable(item.is_available);
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
          is_available: isAvailable
        });
        alert('Beverage updated successfully.');
      } else {
        await api.post('/tea-items', {
          name,
          price: Number(price),
          is_available: isAvailable
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
    const n = name.toLowerCase();
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
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-error'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <h3 className="beverage-title-admin" style={{ marginTop: '1.25rem' }}>{item.name}</h3>
                  <p className="beverage-price-admin">₹{Number(item.price).toFixed(2)}</p>

                  <div className="beverage-actions-admin" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary w-full"
                      onClick={() => handleOpenEdit(item)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Edit2 size={14} />
                      Edit Beverage
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
      `}</style>
    </div>
  );
}
