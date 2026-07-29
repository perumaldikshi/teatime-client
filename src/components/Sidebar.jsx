import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  Coffee, 
  History, 
  Bell, 
  User, 
  Users, 
  BarChart2, 
  Sliders, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Coffee as TeaMasterIcon
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/order', label: 'Order Drink', icon: <Coffee size={18} /> },
    { to: '/history', label: 'My History', icon: <History size={18} /> },
    { to: '/notifications', label: 'Alerts', icon: <Bell size={18} /> },
    { to: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ];

  const adminLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/employees', label: 'Employees', icon: <Users size={18} /> },
    { to: '/tea-master', label: 'Tea Master', icon: <TeaMasterIcon size={18} /> },
    { to: '/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    { to: '/setup', label: 'Setup', icon: <Sliders size={18} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Sidebar Trigger */}
      <div className="mobile-header">
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-logo">🍵 TeaTime</span>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && <div className="sidebar-overlay-mobile" onClick={() => setIsOpen(false)}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🍵</span>
          <span className="brand-name">TeaTime</span>
        </div>

        <div className="user-summary">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrator' : user?.department || 'Employee'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? (
              <>
                <Sun size={18} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      
      {/* Sidebar Specific CSS */}
      <style>{`
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background-color: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          align-items: center;
          padding: 0 1rem;
          z-index: 99;
        }
        
        .mobile-toggle {
          background: transparent;
          border: none;
          color: var(--color-text);
          cursor: pointer;
          padding: 4px;
        }
        
        .mobile-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.25rem;
          margin-left: 1rem;
          color: var(--color-primary);
        }

        .sidebar-overlay-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(12, 38, 25, 0.4);
          backdrop-filter: blur(2px);
          z-index: 98;
        }

        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background-color: var(--color-surface);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform var(--transition-normal);
        }

        .sidebar-brand {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .brand-icon {
          font-size: 1.75rem;
        }

        .brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--color-primary);
          letter-spacing: -0.03em;
        }

        .user-summary {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--color-border);
          background: linear-gradient(180deg, transparent, var(--color-background));
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: var(--color-primary);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          box-shadow: 0 4px 10px hsla(158, 42%, 40%, 0.15);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .sidebar-nav {
          padding: 1.5rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          overflow-y: auto;
        }

        .nav-link {
          text-decoration: none;
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--color-text);
          background-color: var(--color-surface-hover);
          transform: translateX(4px);
        }

        .nav-link.active {
          color: var(--color-primary);
          background-color: var(--color-primary-light);
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .theme-toggle-btn, .logout-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          color: var(--color-text-secondary);
          padding: 0.65rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          justify-content: flex-start;
        }

        .theme-toggle-btn:hover {
          color: var(--color-text);
          background-color: var(--color-surface-hover);
        }

        .logout-btn {
          color: var(--color-error);
        }

        .logout-btn:hover {
          background-color: var(--color-error-bg);
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }
          
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
