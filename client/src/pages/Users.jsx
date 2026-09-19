import { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { Users as UsersIcon, Plus, AlertCircle, Shield, X, Check, Ban, Eye, EyeOff } from 'lucide-react';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'USER', 'ROLE'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationUnitId: '',
    roleId: ''
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: ''
  });

  const { hasPermission } = usePermissions();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, unitsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: {} })),
        api.get('/roles').catch(() => ({ data: {} })),
        api.get('/organization-units').catch(() => ({ data: {} }))
      ]);

      const usersData = usersRes.data?.users || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
      const rolesData = rolesRes.data?.roles || rolesRes.data?.data || (Array.isArray(rolesRes.data) ? rolesRes.data : []);
      const unitsData = unitsRes.data?.units || unitsRes.data?.data || (Array.isArray(unitsRes.data) ? unitsRes.data : []);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have official authorization clearance to access the user directory.');
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load user directory and role definitions.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post('/users', userForm);
      setActiveModal(null);
      setUserForm({ name: '', email: '', password: '', organizationUnitId: '', roleId: '' });
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.response?.data?.error || 'Failed to provision user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post('/roles', roleForm);
      setActiveModal(null);
      setRoleForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.response?.data?.error || 'Failed to create role.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this officer account?')) return;
    try {
      await api.patch(`/users/${userId}/deactivate`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user.');
    }
  };

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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Users & Authorization Roles</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            User identity directory, assigned scope boundaries, and role-based capability mapping.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {hasPermission('ROLE_CREATE') && (
            <button className="btn btn-secondary" onClick={() => setActiveModal('ROLE')}>
              <Plus size={16} /> Create Role
            </button>
          )}

          {hasPermission('USER_CREATE') && (
            <button className="btn btn-primary" onClick={() => setActiveModal('USER')}>
              <Plus size={16} /> Provision User Account
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'var(--danger-bg)', 
          border: '1px solid var(--danger-border)',
          color: 'var(--danger-text)', 
          padding: '14px 18px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading user records and active roles...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
          {/* User Table */}
          <div className="gov-card">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <UsersIcon size={18} /> Authorized User Directory ({users.length})
              </div>
            </div>

            <div className="gov-card-body" style={{ padding: 0 }}>
              <div className="gov-table-container" style={{ border: 'none' }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Full Name / Email</th>
                      <th>Assigned Role</th>
                      <th>Organization Unit</th>
                      <th>Account Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          No users registered or accessible under current scope.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span className="badge badge-info">
                              {u.role?.name || u.roleName || 'OFFICER'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {u.organizationUnit?.name || u.unitName || 'Central Department'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${u.status === 'INACTIVE' ? 'badge-danger' : 'badge-success'}`}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {hasPermission('USER_DEACTIVATE') && u.status !== 'INACTIVE' && (
                              <button 
                                onClick={() => handleDeactivateUser(u.id)}
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger-text)' }}
                              >
                                <Ban size={14} /> Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Roles Side Panel */}
          <div className="gov-card">
            <div className="gov-card-header">
              <div className="gov-card-title">
                <Shield size={18} /> Roles ({roles.length})
              </div>
            </div>
            <div className="gov-card-body" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {roles.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No roles created yet. Click "Create Role" above.
                  </div>
                ) : (
                  roles.map((r) => (
                    <div key={r.id || r.name} style={{ padding: '10px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--govt-navy)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {r.description || 'Dynamic DRBAC Role'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVISION USER MODAL */}
      {activeModal === 'USER' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Provision User Account</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                
                <div className="input-group">
                  <label className="input-label">Full Officer Name *</label>
                  <input className="input-field" placeholder="e.g. Officer Vikram Sharma" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Official Email Address *</label>
                  <input type="email" className="input-field" placeholder="officer@agency.gov.in" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Initial Account Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="input-field" 
                      placeholder="••••••••" 
                      value={userForm.password} 
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                      required 
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {units.length > 0 && (
                    <div className="input-group">
                      <label className="input-label">Assigned Unit</label>
                      <select className="input-field" value={userForm.organizationUnitId} onChange={(e) => setUserForm({ ...userForm, organizationUnitId: e.target.value })}>
                        <option value="">Select Unit...</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  )}

                  {roles.length > 0 && (
                    <div className="input-group">
                      <label className="input-label">Assigned Role</label>
                      <select className="input-field" value={userForm.roleId} onChange={(e) => setUserForm({ ...userForm, roleId: e.target.value })}>
                        <option value="">Select Role...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Provisioning...' : <><Check size={16} /> Provision User Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {activeModal === 'ROLE' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Create Authorization Role</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                
                <div className="input-group">
                  <label className="input-label">Role Name *</label>
                  <input className="input-field" placeholder="e.g. SENIOR_INVESTIGATOR" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input-field" placeholder="Describe capabilities granted..." value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : <><Check size={16} /> Create Role</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
