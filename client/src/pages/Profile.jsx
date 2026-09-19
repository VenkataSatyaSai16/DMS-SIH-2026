import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { User, ShieldCheck, Building, Key, Lock, CheckCircle2, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

export const Profile = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password Change State
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setProfileData(response.data.user || response.data);
      } catch (err) {
        setError('Failed to refresh profile details from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New password and confirmation password do not match.');
      return;
    }

    if (pwdForm.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    setPwdSubmitting(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdSuccess(response.data?.message || 'Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password. Verify current password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const officer = profileData || authUser || {};

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Officer Credentials & Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Verified identity details, assigned scope privileges, and security settings.
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <CheckCircle2 size={14} style={{ marginRight: '6px' }} /> Verified Officer Account
        </span>
      </div>

      {error && (
        <div style={{ 
          background: 'var(--warning-bg)', 
          border: '1px solid var(--warning-border)', 
          color: 'var(--warning-text)',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="gov-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading official profile data...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* Identity Card */}
          <div className="gov-card">
            <div className="gov-card-header" style={{ flexDirection: 'column', textAlign: 'center', gap: '12px', padding: '24px 20px 16px' }}>
              <div style={{ 
                background: '#e0f2fe', 
                padding: '16px', 
                borderRadius: '50%',
                display: 'inline-flex',
                color: 'var(--govt-navy)'
              }}>
                <User size={40} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--govt-navy)', marginBottom: '4px' }}>{officer.name || 'Authorized Officer'}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{officer.email}</div>
              </div>
              <span className="badge badge-info" style={{ marginTop: '4px' }}>
                {officer.role?.name || officer.role || 'SECURITY_OFFICER'}
              </span>
            </div>

            <div className="gov-card-body" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>OFFICER NAME</div>
                  <div style={{ fontWeight: 600, color: 'var(--govt-navy)', marginTop: '2px' }}>
                    {officer.name || 'Authorized Officer'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>OFFICIAL EMAIL ADDRESS</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {officer.email || 'officer@gov.in'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>ASSIGNED DEPARTMENT / UNIT</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} color="var(--govt-navy)" />
                    {officer.organizationUnit?.name || 'Central Department'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>ACCOUNT STATUS</div>
                  <div style={{ fontWeight: 600, color: 'var(--success-text)', marginTop: '2px' }}>
                    Active & Authenticated
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities & Security Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <Key size={18} /> Assigned Capabilities & Privileges
                </div>
              </div>
              <div className="gov-card-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  The following official capabilities are assigned to your officer account and department scope:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {officer.capabilities && officer.capabilities.length > 0 ? (
                    officer.capabilities.map((cap, i) => (
                      <span key={i} className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                        <ShieldCheck size={12} style={{ marginRight: '6px' }} /> {cap}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}><ShieldCheck size={12} style={{ marginRight: '6px' }} /> Case Clearance</span>
                      <span className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}><ShieldCheck size={12} style={{ marginRight: '6px' }} /> Digital Evidence Access</span>
                      <span className="badge badge-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }}><ShieldCheck size={12} style={{ marginRight: '6px' }} /> Department Unit Authorization</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <Lock size={18} /> Update Security Password
                </div>
              </div>

              <div className="gov-card-body">
                {pwdError && (
                  <div style={{ 
                    background: 'var(--danger-bg)', 
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    {pwdError}
                  </div>
                )}

                {pwdSuccess && (
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} />
                    {pwdSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="currentPassword">Current Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        id="currentPassword"
                        type={showCurrentPwd ? 'text' : 'password'} 
                        className="input-field" 
                        placeholder="Enter current password..."
                        value={pwdForm.currentPassword}
                        onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                        required 
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                        title={showCurrentPwd ? "Hide Password" : "Show Password"}
                      >
                        {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="newPassword">New Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          id="newPassword"
                          type={showNewPwd ? 'text' : 'password'} 
                          className="input-field" 
                          placeholder="Min 6 characters..."
                          value={pwdForm.newPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                          required 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          title={showNewPwd ? "Hide Password" : "Show Password"}
                        >
                          {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="confirmPassword">Confirm New Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          id="confirmPassword"
                          type={showConfirmPwd ? 'text' : 'password'} 
                          className="input-field" 
                          placeholder="Re-enter new password..."
                          value={pwdForm.confirmPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                          required 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          title={showConfirmPwd ? "Hide Password" : "Show Password"}
                        >
                          {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ marginTop: '8px' }}
                    disabled={pwdSubmitting}
                  >
                    {pwdSubmitting ? 'Updating Password...' : <><Check size={16} /> Update Password</>}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
