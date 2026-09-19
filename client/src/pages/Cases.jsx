import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { Search, Plus, FileText, AlertCircle, Eye, X, Check } from 'lucide-react';

export const Cases = () => {
  const [cases, setCases] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseType: 'CRIMINAL',
    priority: 'NORMAL',
    scopeType: 'RESTRICTED',
    organizationUnitId: ''
  });

  const { hasPermission } = usePermissions();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const [casesRes, unitsRes] = await Promise.all([
        api.get('/cases'),
        api.get('/organization-units').catch(() => ({ data: {} }))
      ]);
      
      const casesData = casesRes.data?.cases || casesRes.data?.data || (Array.isArray(casesRes.data) ? casesRes.data : []);
      const unitsData = unitsRes.data?.units || unitsRes.data?.data || (Array.isArray(unitsRes.data) ? unitsRes.data : []);
      
      setCases(Array.isArray(casesData) ? casesData : []);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have authorization clearance (CASE_VIEW) to access official case records.');
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load official case records. Please verify server connectivity.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        caseType: formData.caseType || 'CRIMINAL',
        status: 'ACTIVE',
        priority: formData.priority || 'NORMAL',
        unitId: formData.organizationUnitId || (units[0] ? units[0].id : undefined)
      };

      await api.post('/cases', payload);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        caseType: 'CRIMINAL',
        priority: 'NORMAL',
        scopeType: 'RESTRICTED',
        organizationUnitId: ''
      });
      fetchCases();
    } catch (err) {
      const errMsg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        : (err.response?.data?.message || 'Failed to create case record.');
      setModalError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Case & Evidence Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Official registry of active case files, digital evidence, and access scopes.
          </p>
        </div>
        
        {/* Capability check: Only show Create Case button if authorized */}
        {hasPermission('CASE_CREATE') && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Register New Case
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="gov-card" style={{ marginBottom: '20px' }}>
        <div className="gov-card-body" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search case registry by ID or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px', width: '100%' }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              Showing <strong>{filteredCases.length}</strong> case record(s)
            </div>
          </div>
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
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading official case records from server...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="gov-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px', margin: '0 auto', color: 'var(--govt-navy)' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>No Case Records Found</p>
          <p style={{ fontSize: '0.9rem' }}>No case files match your search filter or scope access.</p>
        </div>
      ) : (
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Case Reference ID</th>
                <th>Case Title</th>
                <th>Classification / Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--govt-navy)' }}>
                      {c.caseId || `CASE-${c.id.substring(0,8).toUpperCase()}`}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {c.description?.length > 80 ? `${c.description.substring(0, 80)}...` : (c.description || 'No description provided')}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {c.caseType || 'GENERAL'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.priority === 'HIGH' || c.priority === 'CRITICAL' ? 'badge-danger' : 'badge-info'}`}>
                      {c.priority || 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      c.status === 'ACTIVE' ? 'badge-success' : 
                      c.status === 'CLOSED' ? 'badge-danger' : 
                      c.status === 'ARCHIVED' ? 'badge-secondary' : 'badge-info'
                    }`}>
                      {c.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link 
                      to={`/cases/${c.id}`} 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      <Eye size={14} /> Open File
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CASE MODAL DIALOG */}
      {showCreateModal && (
        <div className="gov-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Register New Official Case</div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCase}>
              <div className="gov-modal-body">
                {modalError && (
                  <div style={{ 
                    background: 'var(--danger-bg)', 
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}>
                    {modalError}
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label" htmlFor="title">Case Title *</label>
                  <input 
                    id="title"
                    type="text"
                    className="input-field"
                    placeholder="e.g., Financial Fraud Investigation #2026"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="description">Case Description *</label>
                  <textarea 
                    id="description"
                    className="input-field"
                    placeholder="Enter official case details and summary..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="caseType">Case Type</label>
                    <select 
                      id="caseType"
                      className="input-field"
                      value={formData.caseType}
                      onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                    >
                      <option value="CRIMINAL">CRIMINAL</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="CYBER">CYBER</option>
                      <option value="INTERNAL">INTERNAL</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="priority">Priority</label>
                    <select 
                      id="priority"
                      className="input-field"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="scopeType">Scope Classification</label>
                    <select 
                      id="scopeType"
                      className="input-field"
                      value={formData.scopeType}
                      onChange={(e) => setFormData({ ...formData, scopeType: e.target.value })}
                    >
                      <option value="RESTRICTED">RESTRICTED</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                  </div>

                  {units.length > 0 && (
                    <div className="input-group">
                      <label className="input-label" htmlFor="organizationUnitId">Assigned Unit</label>
                      <select 
                        id="organizationUnitId"
                        className="input-field"
                        value={formData.organizationUnitId}
                        onChange={(e) => setFormData({ ...formData, organizationUnitId: e.target.value })}
                      >
                        <option value="">Select Unit...</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="gov-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : <><Check size={16} /> Submit & Register</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
