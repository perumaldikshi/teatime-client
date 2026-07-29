import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Mail, Shield, Building, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-view">
      <header className="page-header">
        <h1>My Account</h1>
        <p className="subtitle">View your credentials and adjust display configurations</p>
      </header>

      <div className="profile-layout grid grid-cols-2 gap-lg" style={{ marginTop: '2rem' }}>
        {/* Profile Card */}
        <div className="card card-header-accent profile-card-inner">
          <div className="profile-badge-large">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <h2 className="profile-name-large">{user?.name}</h2>
          <span className="profile-role-badge">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</span>

          <div className="profile-details-list">
            <div className="detail-item">
              <Mail size={18} className="item-icon" />
              <div>
                <label>Email Address</label>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="detail-item">
              <Building size={18} className="item-icon" />
              <div>
                <label>Department</label>
                <p>{user?.department || 'System'}</p>
              </div>
            </div>

            <div className="detail-item">
              <Shield size={18} className="item-icon" />
              <div>
                <label>Access Role</label>
                <p style={{ textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="configurations-panel">
          <div className="card flex-col-between" style={{ height: '100%' }}>
            <div>
              <h3>System Settings</h3>
              <p className="desc-text" style={{ marginTop: '0.25rem' }}>Customize your web interface configurations</p>

              <div className="divider"></div>

              <div className="setting-toggle-row flex-between">
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                    Theme Customization
                  </h4>
                  <p className="desc-text" style={{ fontSize: '0.85rem' }}>
                    Toggle between Light and Dark interface modes
                  </p>
                </div>
                <label className="switch-toggle">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                  <span className="slider-round"></span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button className="btn btn-danger w-full logout-btn-profile" onClick={handleLogout}>
                <LogOut size={18} />
                Sign Out from TeaTime
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-card-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem;
          text-align: center;
        }

        .profile-badge-large {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background-color: var(--color-primary-light);
          color: var(--color-primary);
          font-size: 2.25rem;
          font-family: var(--font-display);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px hsla(158, 42%, 40%, 0.1);
        }

        .profile-name-large {
          font-size: 1.5rem;
          color: var(--color-text);
        }

        .profile-role-badge {
          background-color: var(--color-primary);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          margin-top: 0.5rem;
        }

        .profile-details-list {
          width: 100%;
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
        }

        .detail-item {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: var(--color-background);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }

        .detail-item .item-icon {
          color: var(--color-primary);
        }

        .detail-item label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .detail-item p {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .flex-col-between {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .setting-toggle-row {
          padding: 1.25rem 0;
        }

        /* Switch styling */
        .switch-toggle {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }

        .switch-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider-round {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-border);
          transition: .3s;
          border-radius: 34px;
        }

        .slider-round:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        input:checked + .slider-round {
          background-color: var(--color-primary);
        }

        input:checked + .slider-round:before {
          transform: translateX(22px);
        }

        .logout-btn-profile {
          height: 52px;
        }
      `}</style>
    </div>
  );
}
