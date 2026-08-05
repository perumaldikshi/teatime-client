import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

export default function History() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(''); // '', 'ordered', 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history', {
        params: {
          page: currentPage,
          limit,
          status: statusFilter || undefined,
          search: isAdmin && searchQuery ? searchQuery : undefined
        }
      });
      setOrders(res.data.orders);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory();
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
    <div className="history-view">
      <header className="page-header">
        <h1>{isAdmin ? 'System Order History' : 'My Order History'}</h1>
        <p className="subtitle">{isAdmin ? 'Monitor and review employees orders' : 'Review your past tea and coffee submissions'}</p>
      </header>

      {/* Filters Toolbar */}
      <div className="toolbar card" style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="filters-row">
            {isAdmin && (
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search employee or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
              </div>
            )}

            <div className="filter-select-group">
              <Filter size={18} className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="ordered">Ordered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {isAdmin && <th>Employee</th>}
                {isAdmin && <th>Department</th>}
                <th>Beverage</th>
                <th>Sugar</th>
                <th>Quantity</th>
                {isAdmin && <th>Amount</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.order_date || new Date(order.created_at).toLocaleDateString()}</td>
                    {isAdmin && <td>{order.employee_name || 'System User'}</td>}
                    {isAdmin && <td>{order.department || 'N/A'}</td>}
                    <td>
                      <span style={{ marginRight: '0.5rem' }}>{getBeverageEmoji(order.tea_name)}</span>
                      {order.tea_name}
                    </td>
                    <td>
                      {order.item_type === 'drink' ? (
                        <span className={`badge sugar-history-badge ${order.sugar_preference === 'with_sugar' ? 'sugar-with-badge' : 'sugar-without-badge'}`}>
                          {order.sugar_preference === 'with_sugar' ? '🍬 With Sugar' : '🚫 No Sugar'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.quantity}</td>
                    {isAdmin && (
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{Number(order.amount).toFixed(2)}
                      </td>
                    )}
                    <td>
                      <span className={`badge ${order.status === 'ordered' ? 'badge-success' : 'badge-error'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 5} className="no-data">
                    No order records found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-row flex-between" style={{ marginTop: '1.5rem' }}>
          <span className="pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .toolbar {
          padding: 1rem 1.5rem;
        }

        .filter-form {
          width: 100%;
        }

        .filters-row {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          display: flex;
          gap: 0.5rem;
          flex: 1;
        }

        .search-box input {
          width: 100%;
          padding-left: 2.5rem;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .filter-select-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-select-group select {
          padding-left: 2.5rem;
          min-width: 160px;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .no-data {
          text-align: center;
          color: var(--color-text-secondary);
          padding: 3rem 0;
          font-weight: 500;
        }

        .sugar-history-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
        }

        .sugar-with-badge {
          background-color: hsla(142, 70%, 42%, 0.10);
          color: hsl(142, 60%, 35%);
          border: 1px solid hsla(142, 70%, 42%, 0.25);
        }

        .sugar-without-badge {
          background-color: hsla(0, 70%, 55%, 0.08);
          color: hsl(0, 60%, 45%);
          border: 1px solid hsla(0, 70%, 55%, 0.20);
        }

        .pagination-info {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
