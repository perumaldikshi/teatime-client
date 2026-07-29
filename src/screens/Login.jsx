import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  
  const { login, loading, setLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setApiError('');

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password: password
      });

      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop"></div>
      
      <div className="login-card card card-header-accent">
        <div className="login-header">
          <span className="logo-emoji">🍵</span>
          <h1>TeaTime</h1>
          <p className="subtitle">Management System</p>
        </div>

        {apiError && (
          <div className="error-alert">
            <span>⚠️</span>
            <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? 'input-error' : ''}
              autoComplete="email"
            />
            {emailError && <span className="error-text">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? 'input-error' : ''}
              autoComplete="current-password"
            />
            {passwordError && <span className="error-text">{passwordError}</span>}
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1.5rem;
          background-color: var(--color-background);
        }

        .login-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 10% 20%, hsla(158, 42%, 40%, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, hsla(43, 85%, 52%, 0.06) 0%, transparent 40%);
          z-index: 1;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          z-index: 2;
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .login-header h1 {
          font-size: 2.25rem;
          color: var(--color-primary);
          line-height: 1.1;
        }

        .login-header .subtitle {
          color: var(--color-text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }

        .error-alert {
          background-color: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid hsla(0, 72%, 50%, 0.15);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .w-full {
          width: 100%;
        }

      `}</style>
    </div>
  );
}
