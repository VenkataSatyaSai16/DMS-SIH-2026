import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { Building2, Plus, AlertCircle, X, Check, Ban, Eye } from 'lucide-react';

export const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parentId: ''
  });

  const { hasPermission } = usePermissions();

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organization-units');
      const unitsData = response.data?.units || response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have authorization clearance (UNIT_VIEW) to access organization units.');
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load official organization units list.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        parentId: formData.parentId || undefined
      };

      await api.post('/organization-units', payload);
      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '', parentId: '' });
      fetchUnits();
    } catch (err) {
      setModalError(err.response?.data?.message || err.response?.data?.error || 'Failed to create organization unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to deactivate this organization unit?')) return;
    try {
      await api.patch(`/organization-units/${unitId}/deactivate`);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate unit.');
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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Organization Units Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Administrative hierarchy, law enforcement units, and regional departments.
          </p>
        </div>

        {hasPermission('UNIT_CREATE') && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Organization Unit
          </button>
        )}
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
          Loading organization units directory...
        </div>
      ) : units.length === 0 ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ opacity: 0.3, marginBottom: '16px', margin: '0 auto', color: 'var(--govt-navy)' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>No Units Found</p>
          <p style={{ fontSize: '0.9rem' }}>No organizational units are currently registered.</p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Unit Code</th>
                <th>Organization Unit Name</th>
                <th>Description / Scope</th>
                <th>Parent Unit</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--govt-navy)' }}>
                      {unit.code || `UNIT-${unit.id.substring(0,6).toUpperCase()}`}
                    </div>
                  </td>
                  <td>
                    <Link to={`/units/${unit.id}`} style={{ fontWeight: 600, color: 'var(--govt-navy)' }}>
                      {unit.name}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {unit.description || 'No description provided.'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {unit.parent?.name || unit.parentId || 'Root Organization'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${unit.status === 'INACTIVE' || unit.isActive === false ? 'badge-danger' : 'badge-success'}`}>
                      {unit.isActive === false ? 'INACTIVE' : (unit.status || 'ACTIVE')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link 
                        to={`/units/${unit.id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} /> Open Unit
                      </Link>

                      {hasPermission('UNIT_DEACTIVATE') && unit.isActive !== false && (
                        <button 
                          onClick={() => handleDeactivateUnit(unit.id)}
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger-text)' }}
                          title="Deactivate Unit"
                        >
                          <Ban size={14} /> Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE UNIT MODAL */}
      {showCreateModal && (
        <div className="gov-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Create Organization Unit</div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUnit}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                
                <div className="input-group">
                  <label className="input-label">Unit Name *</label>
                  <input className="input-field" placeholder="e.g. Cyber Crime Division" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Unit Code *</label>
                  <input className="input-field" placeholder="e.g. CCD-01" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input-field" placeholder="Describe unit responsibilities..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {units.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">Parent Organization Unit</label>
                    <select className="input-field" value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}>
                      <option value="">None (Top-Level Unit)</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : <><Check size={16} /> Create Unit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
