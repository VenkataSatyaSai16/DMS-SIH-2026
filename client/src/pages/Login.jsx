import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Fixed Top Header Navbar */}
      <header style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        backgroundColor: 'var(--govt-navy)',
        color: '#ffffff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '3px solid var(--govt-gold)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <ShieldCheck size={28} color="#ffffff" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Secure Digital Document Management System
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              Official Case & Digital Evidence Authorization Portal
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Form Box Container with Top Offset */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: 'calc(var(--header-height) + 40px)',
        paddingBottom: '40px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        <div className="gov-card" style={{ 
          width: '100%', 
          maxWidth: '440px',
          boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
          borderTop: '4px solid var(--govt-navy)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: 0
        }}>
          <div className="gov-card-header" style={{ flexDirection: 'column', textAlign: 'center', gap: '10px', padding: '28px 24px 16px' }}>
            <div style={{ 
              background: '#e0f2fe', 
              padding: '14px', 
              borderRadius: '50%',
              display: 'inline-flex',
              color: 'var(--govt-navy)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontSize: '1.35rem', color: 'var(--govt-navy)', margin: 0 }}>Official User Login</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Enter your authorized department credentials to access the system.
            </p>
          </div>

          <div className="gov-card-body" style={{ padding: '24px 28px' }}>
            {error && (
              <div style={{ 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                padding: '12px 14px',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
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
                <div style={{ position: 'relative' }}>
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '11px', fontSize: '0.95rem', fontWeight: 600 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating Credentials...' : 'Authenticate & Sign In'}
              </button>
            </form>
          </div>

          <div style={{ 
            padding: '14px 20px', 
            background: '#f8fafc', 
            borderTop: '1px solid var(--border-color)', 
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            Restricted System • Unauthorized access is strictly prohibited and monitored.
          </div>
        </div>
      </div>
    </div>
  );
};
