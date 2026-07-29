import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, ShieldAlert, Check, X, Shield } from 'lucide-react';

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

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees', {
        params: { search: search || undefined }
      });
      setEmployees(res.data.employees);
    } catch (err) {
      alert(err.message || 'Failed to query employees database.');
    } finally {
      setLoading(false);
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
    setModalVisible(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department || '');
    setPassword(''); // Leave empty to not change password
    setRole(emp.role);
    setIsActive(emp.is_active);
    setModalVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !department || (!editingEmployee && !password)) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (editingEmployee) {
        // Update employee
        await api.put(`/employees/${editingEmployee.id}`, {
          name,
          email,
          department,
          role,
          is_active: isActive,
          password: password || undefined
        });
        alert('Employee details updated successfully.');
      } else {
        // Create employee
        await api.post('/employees', {
          name,
          email,
          password,
          role,
          department
        });
        alert('New employee created successfully.');
      }
      setModalVisible(false);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Database registration failed.');
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
                      <span className={`badge ${emp.role === 'admin' ? 'badge-warning' : 'badge-muted'}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {emp.role === 'admin' && <Shield size={12} style={{ marginRight: '0.25rem' }} />}
                        {emp.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-error'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell flex-between" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
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
        <div className="modal-overlay">
          <div className="modal-content card card-header-accent">
            <button className="modal-close-x" onClick={() => setModalVisible(false)}>
              <X size={20} />
            </button>
            <h3>{editingEmployee ? 'Edit Employee Details' : 'Create New Employee'}</h3>
            <p className="desc-text" style={{ marginBottom: '1.5rem' }}>
              {editingEmployee ? 'Update user account information and configurations' : 'Register a new profile credentials in the TeaTime database'}
            </p>

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

              <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Save Changes' : 'Create Account'}
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

        .modal-close-x {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-x:hover {
          background-color: var(--color-background);
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
