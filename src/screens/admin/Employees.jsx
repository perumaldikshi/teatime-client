import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, ShieldAlert, Check, X, Shield, Trash2 } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal toggle states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [isActive, setIsActive] = useState(true);
  const [canSelectCupType, setCanSelectCupType] = useState(false);
  const [canViewAllOrders, setCanViewAllOrders] = useState(false);

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

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees', {
        params: { search }
      });
      setEmployees(res.data.employees);
    } catch (err) {
      alert(err.message || 'Failed to fetch employee directories.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the employee account for "${empName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/employees/${empId}`);
      alert(res.data.message || 'Employee account removed.');
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to delete employee account.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setDepartment('');
    setPassword('');
    setRole('employee');
    setIsActive(true);
    setCanSelectCupType(false);
    setCanViewAllOrders(false);
    setFormError('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department || '');
    setPassword(''); // Leave empty to not change password
    setRole(emp.role);
    setIsActive(Boolean(emp.is_active));
    setCanSelectCupType(Boolean(emp.can_select_cup_type));
    setCanViewAllOrders(Boolean(emp.can_view_all_orders));
    setFormError('');
    setModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !email.trim() || !department.trim() || (!editingEmployee && !password)) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEmployee) {
        // Update employee
        await api.put(`/employees/${editingEmployee.id}`, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          department: department.trim(),
          role,
          is_active: isActive,
          can_select_cup_type: canSelectCupType,
          can_view_all_orders: canViewAllOrders,
          password: password || undefined
        });
        setModalVisible(false);
        fetchEmployees();
        alert('Employee details updated successfully.');
      } else {
        // Create employee
        await api.post('/employees', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          department: department.trim(),
          can_select_cup_type: canSelectCupType,
          can_view_all_orders: canViewAllOrders
        });
        setModalVisible(false);
        fetchEmployees();
        alert('New employee created successfully.');
      }
    } catch (err) {
      setFormError(err.message || 'Database registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (emp) => {
    try {
      await api.put(`/employees/${emp.id}`, {
        is_active: !emp.is_active
      });
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Status toggle failed.');
    }
  };

  return (
    <div className="employees-view">
      <header className="page-header flex-between">
        <div>
          <h1>Employee Management</h1>
          <p className="subtitle">Add, edit, and manage corporate employee accounts</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          Create Employee
        </button>
      </header>

      {/* Toolbar Search box */}
      <div className="toolbar card" style={{ marginTop: '2rem' }}>
        <div className="search-box-full">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search employees by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                <th>Employee Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees && employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="employee-table-cell">
                        <div className="emp-avatar-sm">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="emp-name-text">{emp.name}</span>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td><span className="dept-badge">{emp.department || 'General'}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge ${emp.role === 'admin' ? 'badge-warning' : 'badge-muted'}`} style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
                          {emp.role === 'admin' && <Shield size={12} style={{ marginRight: '0.25rem' }} />}
                          {emp.role.toUpperCase()}
                        </span>
                        {emp.can_view_all_orders && (
                          <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.65rem', width: 'fit-content' }} title="Has permission to view other employees' orders">
                            📋 View All Orders
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-error'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell flex-between" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary btn-icon-sm" 
                          onClick={() => handleOpenEditModal(emp)}
                          title="Edit employee details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(emp)}
                          className={`btn btn-icon-sm ${emp.is_active ? 'btn-danger-outline' : 'btn-success-outline'}`}
                          title={emp.is_active ? 'Suspend account' : 'Activate account'}
                        >
                          {emp.is_active ? <X size={14} /> : <Check size={14} />}
                        </button>
                        <button 
                          className="btn btn-danger-outline btn-icon-sm" 
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          title="Delete employee account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-data">No employees match your search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Employee Modal overlay */}
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
            <h3>{editingEmployee ? 'Edit Employee Details' : 'Create New Employee'}</h3>
            <p className="desc-text" style={{ marginBottom: '1.25rem' }}>
              {editingEmployee ? 'Update user account information and configurations' : 'Register a new profile credentials in the TeaTime database'}
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
                <label htmlFor="modal-name">Full Name *</label>
                <input
                  id="modal-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-email">Email Address *</label>
                <input
                  id="modal-email"
                  type="email"
                  placeholder="e.g. john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-dept">Department *</label>
                <input
                  id="modal-dept"
                  type="text"
                  placeholder="e.g. Engineering, Sales..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-password">Password {editingEmployee ? '(leave blank to keep unchanged)' : '*'}</label>
                <input
                  id="modal-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingEmployee}
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-role">System Role</label>
                <select id="modal-role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {editingEmployee && (
                <div className="form-group flex-between" style={{ flexDirection: 'row', padding: '0.5rem 0' }}>
                  <label htmlFor="modal-active" style={{ cursor: 'pointer' }}>Account Status (Active)</label>
                  <label className="switch-toggle">
                    <input 
                      id="modal-active" 
                      type="checkbox" 
                      checked={isActive} 
                      onChange={(e) => setIsActive(e.target.checked)} 
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>
              )}

              <div className="form-group flex-between" style={{ flexDirection: 'row', padding: '0.5rem 0' }}>
                <label htmlFor="modal-cup-type" style={{ cursor: 'pointer' }}>Allow Cup Type Selection (Paper/Glass)</label>
                <label className="switch-toggle">
                  <input 
                    id="modal-cup-type" 
                    type="checkbox" 
                    checked={canSelectCupType} 
                    onChange={(e) => setCanSelectCupType(e.target.checked)} 
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="form-group flex-between" style={{ flexDirection: 'row', padding: '0.5rem 0', alignItems: 'flex-start' }}>
                <div style={{ paddingRight: '1rem' }}>
                  <label htmlFor="modal-view-orders" style={{ cursor: 'pointer', fontWeight: 600 }}>Allow View All Orders (Distribution Access)</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                    Enables this employee to see what items other employees ordered (emp2, emp3) for tea distribution
                  </span>
                </div>
                <label className="switch-toggle" style={{ marginTop: '4px' }}>
                  <input 
                    id="modal-view-orders" 
                    type="checkbox" 
                    checked={canViewAllOrders} 
                    onChange={(e) => setCanViewAllOrders(e.target.checked)} 
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingEmployee ? 'Saving Changes...' : 'Creating Account...') : (editingEmployee ? 'Save Changes' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .search-box-full {
          position: relative;
        }

        .search-box-full input {
          width: 100%;
          padding-left: 2.5rem;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .employee-table-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .emp-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .emp-name-text {
          font-weight: 600;
          color: var(--color-text);
        }

        .dept-badge {
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .btn-icon-sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-danger-outline {
          background-color: transparent;
          color: var(--color-error);
          border: 1px solid hsla(0, 72%, 50%, 0.2);
        }

        .btn-danger-outline:hover {
          background-color: var(--color-error-bg);
        }

        .btn-success-outline {
          background-color: transparent;
          color: var(--color-success);
          border: 1px solid hsla(142, 60%, 45%, 0.2);
        }

        .btn-success-outline:hover {
          background-color: var(--color-success-bg);
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
          background-color: var(--color-background);
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
