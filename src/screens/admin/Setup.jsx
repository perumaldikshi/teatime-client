import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, User, ChevronRight, ArrowLeft } from 'lucide-react';
export default function Setup() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Time Settings',
      description: 'Configure automatic daily window start times and order cutoff limits.',
      icon: <Clock size={24} />,
      onClick: () => navigate('/setup/time'),
      accentColor: 'var(--color-primary)'
    },
    {
      title: 'Broadcast Push Alert',
      description: 'Trigger and broadcast custom push notifications to registered employee device sessions.',
      icon: <Send size={24} />,
      onClick: () => navigate('/setup/broadcast'),
      accentColor: 'var(--color-accent)'
    },
    {
      title: 'Admin Profile Details',
      description: 'Review your credentials details, role access, and toggle interface themes.',
      icon: <User size={24} />,
      onClick: () => navigate('/profile'),
      accentColor: 'var(--color-success)'
    }
  ];

  return (
    <div className="setup-view">
      <header className="page-header">
        <button className="btn btn-secondary btn-icon-round back-btn" onClick={() => navigate('/')} title="Back to Dashboard">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ marginTop: '1rem' }}>System Configurations</h1>
        <p className="subtitle">Adjust parameters, send broad alerts, and review accounts</p>
      </header>

      <div className="setup-options-list" style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((opt, index) => (
          <div 
            key={index} 
            className="card setup-option-row flex-between"
            onClick={opt.onClick}
            style={{ cursor: 'pointer', padding: '1.75rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div 
                className="setup-icon-box"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  color: opt.accentColor,
                  border: '1px solid var(--color-border)'
                }}
              >
                {opt.icon}
              </div>
              <div>
                <h3 className="setup-title">{opt.title}</h3>
                <p className="desc-text" style={{ marginTop: '0.25rem' }}>{opt.description}</p>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        ))}
      </div>

      <style>{`
        .back-btn {
          width: 36px;
          height: 36px;
        }

        .setup-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .setup-option-row {
          transition: all var(--transition-fast);
        }

        .setup-option-row:hover {
          transform: translateX(6px);
          border-color: var(--color-primary);
        }

        .setup-title {
          font-size: 1.15rem;
          color: var(--color-text);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
