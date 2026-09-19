import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your official credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      background: 'var(--bg-main)'
    }}>
      {/* Top Banner */}
      <header className="app-header-banner" style={{ justifyContent: 'center', textAlign: 'center', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} color="#ffffff" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Secure Digital Document Management System
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Official Case & Digital Evidence Authorization Portal
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Form Box */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="gov-card" style={{ width: '100%', maxWidth: '420px' }}>
          <div className="gov-card-header" style={{ flexDirection: 'column', textAlign: 'center', gap: '8px', padding: '24px 20px 16px' }}>
            <div style={{ 
              background: '#e0f2fe', 
              padding: '12px', 
              borderRadius: '50%',
              display: 'inline-flex',
              color: 'var(--govt-navy)'
            }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontSize: '1.3rem', color: 'var(--govt-navy)' }}>Official User Login</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter your authorized department credentials to access the system.
            </p>
          </div>

          <div className="gov-card-body" style={{ padding: '24px' }}>
            {error && (
              <div style={{ 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Official Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  className="input-field" 
                  placeholder="officer@agency.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label" htmlFor="password">Password</label>
                <input 
                  id="password"
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px', fontSize: '0.95rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating Credentials...' : 'Authenticate & Sign In'}
              </button>
            </form>
          </div>

          <div style={{ 
            padding: '12px 20px', 
            background: '#f8fafc', 
            borderTop: '1px solid var(--border-color)', 
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            Restricted System • Unauthorized access is strictly prohibited and monitored.
          </div>
        </div>
      </div>
    </div>
  );
};
