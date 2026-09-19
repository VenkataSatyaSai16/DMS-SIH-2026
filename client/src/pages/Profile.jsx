import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { User, ShieldCheck, Building, Key, Lock, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            Verified identity details, assigned scope privileges, and active session permissions.
          </p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <CheckCircle2 size={14} style={{ marginRight: '6px' }} /> Verified Officer Credentials
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>OFFICER ID</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--govt-navy)', marginTop: '2px' }}>
                    {officer.id || 'N/A'}
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

          {/* Capabilities & Privileges */}
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
                      <span key={i} className="badge badge-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '4px 10px' }}>
                        <ShieldCheck size={12} style={{ marginRight: '6px' }} /> {cap}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="badge badge-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '4px 10px' }}>CASE_VIEW</span>
                      <span className="badge badge-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '4px 10px' }}>EVIDENCE_VIEW</span>
                      <span className="badge badge-secondary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '4px 10px' }}>UNIT_VIEW</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <Lock size={18} /> Official Session Status
                </div>
              </div>
              <div className="gov-card-body" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--govt-navy)', marginBottom: '4px' }}>Session Status</div>
                    <div>Active & Signed in</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--govt-navy)', marginBottom: '4px' }}>Audit Logging</div>
                    <div>All officer actions logged under Officer ID</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
