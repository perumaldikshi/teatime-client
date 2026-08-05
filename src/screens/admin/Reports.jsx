import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, BarChart2, TrendingUp, Calendar, ShoppingBag, Search, Candy, Ban } from 'lucide-react';

// Today's date in YYYY-MM-DD
const todayStr = () => new Date().toISOString().split('T')[0];

// First day of current month
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

export default function Reports() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('monthly');

  // Custom date range
  const [fromDate, setFromDate] = useState(firstOfMonth());
  const [toDate, setToDate] = useState(todayStr());

  // Build query params based on current mode
  const buildParams = (type = reportType, from = fromDate, to = toDate) => {
    if (type === 'custom') {
      return { startDate: from, endDate: to };
    }
    return { reportType: type };
  };

  const fetchReportSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: buildParams() });
      setReportData(res.data);
    } catch (err) {
      alert(err.message || 'Failed to fetch report summary details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType !== 'custom') {
      fetchReportSummary();
    }
  }, [reportType]);

  // For custom range — fetch only on Apply click
  const handleApplyCustom = () => {
    if (!fromDate || !toDate) {
      alert('Please select both From and To dates.');
      return;
    }
    if (fromDate > toDate) {
      alert('From date cannot be after To date.');
      return;
    }
    fetchReportSummary();
  };

  // Build full download URL with current filters
  const buildDownloadUrl = (type) => {
    const base = `${api.defaults.baseURL}/${type === 'pdf' ? 'download-pdf' : 'download-excel'}`;
    const params = buildParams();
    const qs = new URLSearchParams({ ...params, Authorization: `Bearer ${token}` }).toString();
    return `${base}?${qs}`;
  };

  const handleDownloadPDF = () => window.open(buildDownloadUrl('pdf'), '_blank');
  const handleDownloadExcel = () => window.open(buildDownloadUrl('excel'), '_blank');

  const getBeverageEmoji = (name) => {
    if (!name) return '🥛';
    const n = name.toLowerCase();
    if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
    if (n.includes('green') || n.includes('lemon') || n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    return '🥛';
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order record? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/order/${orderId}`);
      alert(res.data.message || 'Order record removed.');
      fetchReportSummary();
    } catch (err) {
      alert(err.message || 'Failed to delete order record.');
    }
  };

  const scopeLabel =
    reportType === 'custom'
      ? `${fromDate} → ${toDate}`
      : reportType.toUpperCase();

  return (
    <div className="reports-view">
      <header className="page-header">
        <h1>Analytical Reports</h1>
        <p className="subtitle">Track aggregate spending, item volumes, and download spreadsheet logs</p>
      </header>

      {/* ── Filter Toolbar ── */}
      <div className="toolbar card" style={{ marginTop: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Report Period Scope</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="tab-group-full">
            {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((type) => (
              <button
                key={type}
                className={`tab-btn-pill ${reportType === type ? 'active' : ''}`}
                onClick={() => setReportType(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Custom date pickers */}
          {reportType === 'custom' && (
            <div className="date-range-row">
              <div className="date-input-group">
                <label htmlFor="from-date">From</label>
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <span className="date-sep">→</span>
              <div className="date-input-group">
                <label htmlFor="to-date">To</label>
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={todayStr()}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <button
                id="btn-apply-date"
                className="btn btn-primary"
                onClick={handleApplyCustom}
                style={{ height: '38px', padding: '0 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Search size={14} />
                Apply
              </button>
            </div>
          )}
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

          {/* Sugar Summary Cards */}
          <div className="card stats-summary-card sugar-with-card">
            <div className="card-icon-round" style={{ backgroundColor: 'hsla(142,70%,42%,0.12)', color: 'hsl(142,60%,35%)' }}>
              <span style={{ fontSize: '1.4rem' }}>🍬</span>
            </div>
            <div>
              <p className="stat-label">With Sugar</p>
              <h3 className="stat-value" style={{ color: 'hsl(142,60%,35%)' }}>
                {reportData?.sugarSummary?.withSugar ?? 0} cups
              </h3>
            </div>
          </div>

          <div className="card stats-summary-card sugar-without-card">
            <div className="card-icon-round" style={{ backgroundColor: 'hsla(0,70%,55%,0.10)', color: 'hsl(0,60%,45%)' }}>
              <span style={{ fontSize: '1.4rem' }}>🚫</span>
            </div>
            <div>
              <p className="stat-label">Without Sugar</p>
              <h3 className="stat-value" style={{ color: 'hsl(0,60%,45%)' }}>
                {reportData?.sugarSummary?.withoutSugar ?? 0} cups
              </h3>
            </div>
          </div>

          <div className="card stats-summary-card">
            <div className="card-icon-round" style={{ backgroundColor: 'hsla(260,70%,55%,0.10)', color: 'hsl(260,60%,50%)' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="stat-label">Sugar Tracked Total</p>
              <h3 className="stat-value" style={{ color: 'hsl(260,60%,50%)' }}>
                {reportData?.sugarSummary?.total ?? 0} drinks
              </h3>
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
                    <th>Sugar</th>
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
                        <td>
                          {order.item_type === 'drink' ? (
                            <span className={`badge rpt-sugar-badge ${order.sugar_preference === 'with_sugar' ? 'rpt-sugar-with' : 'rpt-sugar-without'}`}>
                              {order.sugar_preference === 'with_sugar' ? '🍬 With' : '🚫 No Sugar'}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>—</span>
                          )}
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
                      <td colSpan={8} className="no-data" style={{ textAlign: 'center', padding: '2rem' }}>
                        No order records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sugar Breakdown per Beverage Panel */}
          {reportData?.beverageSummary && reportData.beverageSummary.some(b => b.item_type === 'drink') && (
            <div className="card grid-colspan-3 sugar-breakdown-card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>☕ Sugar Preference Breakdown by Beverage</h3>
              <div className="sugar-breakdown-grid">
                {reportData.beverageSummary
                  .filter(b => b.item_type === 'drink')
                  .map((bev) => {
                    const drinkTotal = bev.with_sugar + bev.without_sugar;
                    const withPct = drinkTotal > 0 ? Math.round((bev.with_sugar / drinkTotal) * 100) : 0;
                    const withoutPct = drinkTotal > 0 ? 100 - withPct : 0;
                    return (
                      <div key={bev.tea_name} className="sugar-bev-row">
                        <div className="sugar-bev-header">
                          <span className="sugar-bev-name">{getBeverageEmoji(bev.tea_name)} {bev.tea_name}</span>
                          <span className="sugar-bev-total">{drinkTotal} tracked</span>
                        </div>
                        {drinkTotal > 0 ? (
                          <>
                            <div className="sugar-progress-bar">
                              <div
                                className="sugar-bar-with"
                                style={{ width: `${withPct}%` }}
                                title={`With Sugar: ${bev.with_sugar}`}
                              />
                              <div
                                className="sugar-bar-without"
                                style={{ width: `${withoutPct}%` }}
                                title={`Without Sugar: ${bev.without_sugar}`}
                              />
                            </div>
                            <div className="sugar-bar-legend">
                              <span className="legend-with">🍬 With Sugar: <strong>{bev.with_sugar}</strong> ({withPct}%)</span>
                              <span className="legend-without">🚫 No Sugar: <strong>{bev.without_sugar}</strong> ({withoutPct}%)</span>
                            </div>
                          </>
                        ) : (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem' }}>No sugar data recorded yet</p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Exporters Panel */}
          <div className="card grid-colspan-3 exporters-section-card" style={{ padding: '2rem', marginTop: '2rem' }}>
            <div className="exporter-header">
              <span className="exporter-badge">AVAILABLE DOWNLOADS</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.5rem' }}>Export Report Records</h3>
              <p className="desc-text" style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                Download document spreadsheets or formal PDF summaries for <strong>{scopeLabel}</strong>.
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
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn-pill:hover { color: var(--color-text); }

        .tab-btn-pill.active {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        /* ── Date Range Row ── */
        .date-range-row {
          display: flex;
          align-items: flex-end;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .date-input-group label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .date-input-group input[type="date"] {
          height: 38px;
          padding: 0 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          color: var(--color-text);
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .date-input-group input[type="date"]:focus {
          border-color: var(--color-primary);
        }

        .date-sep {
          color: var(--color-text-secondary);
          font-weight: 700;
          padding-bottom: 0.4rem;
        }

        /* ── Exporter ── */
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
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .pdf-icon-bg  { background-color: hsla(0, 72%, 50%, 0.1); color: hsl(0, 72%, 50%); }
        .excel-icon-bg { background-color: hsla(142, 60%, 45%, 0.1); color: hsl(142, 60%, 45%); }

        .subcard-body { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
        .subcard-body h4 { font-size: 1.05rem; font-weight: 700; color: var(--color-text); }
        .subcard-body p  { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 0.5rem; min-height: 2.8rem; }

        .btn-pdf {
          background-color: hsl(0, 72%, 50%); color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          font-weight: 600; font-size: 0.9rem;
          padding: 0.65rem 1rem; border-radius: 8px; border: none; cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .btn-pdf:hover { background-color: hsl(0, 72%, 40%); }

        .btn-excel {
          background-color: hsl(142, 60%, 45%); color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          font-weight: 600; font-size: 0.9rem;
          padding: 0.65rem 1rem; border-radius: 8px; border: none; cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .btn-excel:hover { background-color: hsl(142, 60%, 35%); }

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
        .btn-danger-outline:hover { background-color: var(--color-error-bg); }

        /* Sugar CSS */
        .rpt-sugar-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
        }

        .rpt-sugar-with {
          background-color: hsla(142, 70%, 42%, 0.10);
          color: hsl(142, 60%, 35%);
          border: 1px solid hsla(142, 70%, 42%, 0.25);
        }

        .rpt-sugar-without {
          background-color: hsla(0, 70%, 55%, 0.08);
          color: hsl(0, 60%, 45%);
          border: 1px solid hsla(0, 70%, 55%, 0.20);
        }

        .sugar-breakdown-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
        }

        .sugar-breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .sugar-bev-row {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .sugar-bev-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .sugar-bev-name {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .sugar-bev-total {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          font-weight: 600;
          background-color: var(--color-surface);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .sugar-progress-bar {
          height: 8px;
          display: flex;
          border-radius: 4px;
          overflow: hidden;
          background-color: var(--color-border);
          margin-bottom: 0.5rem;
        }

        .sugar-bar-with {
          background-color: hsl(142, 60%, 45%);
          transition: width 0.3s ease;
        }

        .sugar-bar-without {
          background-color: hsl(0, 60%, 55%);
          transition: width 0.3s ease;
        }

        .sugar-bar-legend {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .legend-with { color: hsl(142, 60%, 35%); }
        .legend-without { color: hsl(0, 60%, 45%); }


        @media (max-width: 900px) {
          .exporters-section-card, .report-table-card { grid-column: span 1; }
          .exporter-grid { grid-template-columns: 1fr; }
          .exporter-subcard { padding: 1.25rem; }
          .tab-group-full { flex-wrap: wrap; }
          .date-range-row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
