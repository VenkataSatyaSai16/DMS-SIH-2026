import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  FileText, 
  UserPlus, 
  Plus, 
  X, 
  Check, 
  Eye, 
  AlertCircle,
  Ban
} from 'lucide-react';

export const UnitDetails = () => {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [members, setMembers] = useState([]);
  const [unitCases, setUnitCases] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'ADD_MEMBER', 'ASSIGN_CASE'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const { hasPermission } = usePermissions();
  const { showSuccess, showError } = useToast();

  const fetchUnitDetails = async () => {
    setLoading(true);
    try {
      const [unitRes, usersRes, casesRes] = await Promise.all([
        api.get(`/organization-units/${id}`),
        api.get('/users').catch(() => ({ data: {} })),
        api.get('/cases').catch(() => ({ data: {} }))
      ]);

      const uData = unitRes.data?.unit || unitRes.data?.data || unitRes.data;
      const uList = usersRes.data?.users || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
      const cList = casesRes.data?.cases || casesRes.data?.data || (Array.isArray(casesRes.data) ? casesRes.data : []);

      setUnit(uData);
      setAllUsers(uList);
      setAllCases(cList);

      // Filter members belonging to this unit
      const unitMembers = uList.filter(user => 
        user.organizationUnitId === id || 
        user.organizationUnit?.id === id || 
        user.memberships?.some(m => m.unitId === id)
      );
      setMembers(unitMembers);

      // Filter cases assigned to this unit
      const casesAssigned = cList.filter(c => 
        c.organizationUnitId === id || 
        c.units?.some(u => u.unitId === id || u.id === id)
      );
      setUnitCases(casesAssigned);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have authorization clearance to view this organization unit.');
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load organization unit details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitDetails();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSubmitting(true);
    setModalError('');

    try {
      await api.post(`/users/${selectedUserId}/unit`, { unitId: id });
      setActiveModal(null);
      setSelectedUserId('');
      fetchUnitDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign member to unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCase = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) return;
    setSubmitting(true);
    setModalError('');

    try {
      await api.post(`/cases/${selectedCaseId}/units`, { unitId: id });
      setActiveModal(null);
      setSelectedCaseId('');
      fetchUnitDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign case to unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUnit = async () => {
    if (!window.confirm('Are you sure you want to deactivate this organization unit?')) return;
    try {
      await api.patch(`/organization-units/${id}/deactivate`);
      showSuccess('Organization unit deactivated successfully.');
      fetchUnitDetails();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate unit.');
    }
  };

  const handleActivateUnit = async () => {
    if (!window.confirm('Are you sure you want to activate this organization unit?')) return;
    try {
      await api.patch(`/organization-units/${id}/activate`);
      showSuccess('Organization unit activated successfully.');
      fetchUnitDetails();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to activate unit.');
    }
  };

  if (loading) {
    return <div className="gov-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading unit details...</div>;
  }

  if (error || !unit) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Link to="/units" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Return to Organization Units
        </Link>
        <div className="gov-card" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--danger-border)' }}>
          <AlertCircle size={48} color="var(--danger-text)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--danger-text)', marginBottom: '8px', fontSize: '1.3rem' }}>Unit Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{error || 'Organization unit record does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/units" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--govt-navy)', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Units Directory
        </Link>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{unit.name}</h1>
            <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {unit.code}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px' }}>
            {unit.description || 'No official description registered for this department unit.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`badge ${unit.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
            {unit.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
          </span>

          {hasPermission('UNIT_DEACTIVATE') && unit.isActive !== false && (
            <button 
              onClick={handleDeactivateUnit}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
            >
              <Ban size={14} /> Deactivate Unit
            </button>
          )}

          {hasPermission('UNIT_ACTIVATE') && unit.isActive === false && (
            <button 
              onClick={handleActivateUnit}
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#16a34a', borderColor: '#86efac' }}
            >
              <Check size={14} /> Activate Unit
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Members Section */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <Users size={18} /> Assigned Officers & Members ({members.length})
            </div>

            {hasPermission('USER_ASSIGN_UNIT') && (
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setActiveModal('ADD_MEMBER')}>
                <UserPlus size={14} /> Add Member
              </button>
            )}
          </div>

          <div className="gov-card-body" style={{ padding: 0 }}>
            {members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No officers currently assigned to this unit.
              </div>
            ) : (
              <div className="gov-table-container" style={{ border: 'none' }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Officer Name</th>
                      <th>Email Address</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.email}</td>
                        <td>
                          <span className="badge badge-secondary">{m.role?.name || m.role || 'OFFICER'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Cases Section */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <FileText size={18} /> Assigned Cases ({unitCases.length})
            </div>

            {hasPermission('CASE_ASSIGN') && (
              <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setActiveModal('ASSIGN_CASE')}>
                <Plus size={14} /> Assign Case
              </button>
            )}
          </div>

          <div className="gov-card-body" style={{ padding: 0 }}>
            {unitCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active cases assigned to this unit yet.
              </div>
            ) : (
              <div className="gov-table-container" style={{ border: 'none' }}>
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitCases.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{c.caseId || `CASE-${c.id.substring(0,6)}`}</td>
                        <td style={{ fontWeight: 500 }}>{c.title}</td>
                        <td>
                          <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>{c.status || 'ACTIVE'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/cases/${c.id}`} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                            <Eye size={12} /> Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD MEMBER MODAL */}
      {activeModal === 'ADD_MEMBER' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Assign Officer to Unit</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                
                <div className="input-group">
                  <label className="input-label">Select Officer *</label>
                  <select className="input-field" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                    <option value="">Choose User...</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedUserId}>
                  {submitting ? 'Assigning...' : <><Check size={16} /> Assign to Unit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CASE MODAL */}
      {activeModal === 'ASSIGN_CASE' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Assign Case to Unit</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignCase}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                
                <div className="input-group">
                  <label className="input-label">Select Case File *</label>
                  <select className="input-field" value={selectedCaseId} onChange={(e) => setSelectedCaseId(e.target.value)} required>
                    <option value="">Choose Case...</option>
                    {allCases.map(c => <option key={c.id} value={c.id}>{c.title} ({c.caseId})</option>)}
                  </select>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !selectedCaseId}>
                  {submitting ? 'Assigning...' : <><Check size={16} /> Assign Case</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
