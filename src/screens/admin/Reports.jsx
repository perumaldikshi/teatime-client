import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, BarChart2, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
  
  const fetchReportSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', {
        params: { reportType }
      });
      setReportData(res.data);
    } catch (err) {
      alert(err.message || 'Failed to fetch report summary details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportSummary();
  }, [reportType]);

  const handleDownloadPDF = () => {
    const url = `${api.defaults.baseURL}/download-pdf?reportType=${reportType}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const handleDownloadExcel = () => {
    const url = `${api.defaults.baseURL}/download-excel?reportType=${reportType}&Authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const getBeverageEmoji = (name) => {
    if (!name) return '🥛';
    const n = name.toLowerCase();
    if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order record? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await api.delete(`/order/${orderId}`);
      alert(res.data.message || 'Order record removed.');
      fetchReportSummary();
    } catch (err) {
      alert(err.message || 'Failed to delete order record.');
    }
  };

  return (
    <div className="reports-view">
      <header className="page-header">
        <h1>Analytical Reports</h1>
        <p className="subtitle">Track aggregate spending, item volumes, and download spreadsheet logs</p>
      </header>

      {/* Scope Toggles */}
      <div className="toolbar card" style={{ marginTop: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Report Period Scope</label>
        <div className="tab-group-full">
          {['daily', 'weekly', 'monthly', 'yearly'].map((type) => {
            const isSelected = reportType === type;
            return (
              <button
                key={type}
                className={`tab-btn-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setReportType(type)}
              >
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="reports-layout grid grid-cols-3 gap-md" style={{ marginTop: '1.5rem' }}>
          {/* Summary Metric Cards */}
          <div className="card stats-summary-card">
            <div className="card-icon-round primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="stat-label">Grand Total Cost</p>
              <h3 className="stat-value">₹{(reportData?.grandTotal || 0).toFixed(2)}</h3>
            </div>
          </div>

          <div className="card stats-summary-card">
            <div className="card-icon-round success">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="stat-label">Total Submissions</p>
              <h3 className="stat-value">{reportData?.orders ? reportData.orders.length : 0} orders</h3>
            </div>
          </div>

          <div className="card stats-summary-card">
            <div className="card-icon-round accent">
              <Calendar size={24} />
            </div>
            <div>
              <p className="stat-label">Date Scope</p>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                {reportData?.dateRange?.startDate} to {reportData?.dateRange?.endDate}
              </h4>
            </div>
          </div>

          {/* Report Order List Table */}
          <div className="card grid-colspan-3 report-table-card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Order Records List</h3>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Beverage</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.orders && reportData.orders.length > 0 ? (
                    reportData.orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>
                          {order.order_date || new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td>{order.employee_name || 'System User'}</td>
                        <td>{order.department || 'N/A'}</td>
                        <td>
                          <span style={{ marginRight: '0.5rem' }}>{getBeverageEmoji(order.tea_name)}</span>
                          {order.tea_name}
                        </td>
                        <td style={{ fontWeight: 600 }}>{order.quantity}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{Number(order.amount).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data" style={{ textAlign: 'center', padding: '2rem' }}>
                        No order records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exporters Panel */}
          <div className="card grid-colspan-3 exporters-section-card" style={{ padding: '2rem', marginTop: '2rem' }}>
            <div className="exporter-header">
              <span className="exporter-badge">AVAILABLE DOWNLOADS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.5rem' }}>Export Report Records</h3>
              <p className="desc-text" style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                Download document spreadsheets or formal PDF summaries of the <strong>{reportType}</strong> scope logs.
              </p>
            </div>
            
            <div className="exporter-grid">
              {/* PDF Card */}
              <div className="exporter-subcard pdf-subcard">
                <div className="subcard-icon-wrapper pdf-icon-bg">
                  <FileText size={24} />
                </div>
                <div className="subcard-body">
                  <h4>Printable PDF Document</h4>
                  <p>Generates a beautifully structured PDF document with company headers, itemized breakdowns, and total amounts.</p>
                  <button className="btn btn-pdf w-full" onClick={handleDownloadPDF}>
                    <Download size={16} />
                    Download PDF Summary
                  </button>
                </div>
              </div>

              {/* Excel Card */}
              <div className="exporter-subcard excel-subcard">
                <div className="subcard-icon-wrapper excel-icon-bg">
                  <Download size={24} />
                </div>
                <div className="subcard-body">
                  <h4>Spreadsheet Log (Excel)</h4>
                  <p>Generates an `.xlsx` workbook featuring row details, numeric formatting, and native SUM calculations for custom analyses.</p>
                  <button className="btn btn-excel w-full" onClick={handleDownloadExcel}>
                    <Download size={16} />
                    Export Excel Sheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-group-full {
          display: flex;
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          padding: 4px;
          border-radius: var(--radius-sm);
          width: fit-content;
        }

        .tab-btn-pill {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.6rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn-pill:hover {
          color: var(--color-text);
        }

        .tab-btn-pill.active {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        .exporters-section-card {
          grid-column: span 3;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
          border-top: 4px solid var(--color-primary);
        }

        .exporter-badge {
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
          display: inline-block;
        }

        .exporter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .exporter-subcard {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }

        .exporter-subcard:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }

        .subcard-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pdf-icon-bg {
          background-color: hsla(0, 72%, 50%, 0.1);
          color: hsl(0, 72%, 50%);
        }

        .excel-icon-bg {
          background-color: hsla(142, 60%, 45%, 0.1);
          color: hsl(142, 60%, 45%);
        }

        .subcard-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .subcard-body h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .subcard-body p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
          margin-bottom: 0.5rem;
          min-height: 2.8rem;
        }

        .btn-pdf {
          background-color: hsl(0, 72%, 50%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .btn-pdf:hover {
          background-color: hsl(0, 72%, 40%);
        }

        .btn-excel {
          background-color: hsl(142, 60%, 45%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .btn-excel:hover {
          background-color: hsl(142, 60%, 35%);
        }

        .report-table-card {
          grid-column: span 3;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
        }

        .btn-danger-outline {
          background-color: transparent;
          border: 1px solid var(--color-error);
          color: var(--color-error);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-danger-outline:hover {
          background-color: var(--color-error-bg);
        }

        @media (max-width: 900px) {
          .exporters-section-card {
            grid-column: span 1;
          }

          .report-table-card {
            grid-column: span 1;
          }

          .exporter-grid {
            grid-template-columns: 1fr;
          }
          
          .exporter-subcard {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
