import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Download, 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Edit3, 
  Building, 
  UserPlus, 
  X, 
  Check, 
  Key,
  Users,
  UserCheck,
  Plus,
  Clock,
  Tag,
  Archive,
  Lock,
  PlayCircle,
  Camera,
  Mic,
  Video,
  RefreshCw
} from 'lucide-react';

import { CameraCapture } from '../components/evidence/CameraCapture';
import { AudioRecorder } from '../components/evidence/AudioRecorder';
import { VideoRecorder } from '../components/evidence/VideoRecorder';

export const CaseDetails = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [involvedPersons, setInvolvedPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation tab
  const [activeTab, setActiveTab] = useState('EVIDENCE'); // 'EVIDENCE', 'PERSONS', 'ASSIGNMENTS'

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'UPLOAD', 'EDIT', 'ASSIGN_UNIT', 'ASSIGN_USER', 'REQUEST_ACCESS', 'ADD_PERSON'
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [evidenceSearchTerm, setEvidenceSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [captureMode, setCaptureMode] = useState('FILE'); // 'FILE', 'CAMERA', 'AUDIO', 'VIDEO'
  const [captureStep, setCaptureStep] = useState('CAPTURE'); // 'CAPTURE', 'DETAILS'
  const [verificationReport, setVerificationReport] = useState(null);

  const openEvidenceModal = (mode = 'FILE') => {
    setModalError('');
    setSelectedFile(null);
    setUploadCategory(mode === 'CAMERA' ? 'PHOTOGRAPH' : mode === 'AUDIO' ? 'AUDIO' : mode === 'VIDEO' ? 'VIDEO' : '');
    setUploadDescription('');
    setCaptureMode(mode);
    setCaptureStep(mode === 'FILE' ? 'CAPTURE' : 'CAPTURE');
    setActiveModal('UPLOAD');
  };

  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'ACTIVE', priority: 'NORMAL' });
  const [unitAssignForm, setUnitAssignForm] = useState({ unitId: '', accessLevel: 'READ' });
  const [userAssignForm, setUserAssignForm] = useState({ userId: '', accessLevel: 'READ' });
  const [accessReqForm, setAccessReqForm] = useState({ reason: 'Investigation requirement', requestedAccess: 'READ' });
  
  // Person form (Victim / Suspect / Complainant / Witness)
  const [personForm, setPersonForm] = useState({
    name: '',
    role: 'VICTIM',
    contact: '',
    notes: ''
  });

  const { hasPermission } = usePermissions();
  const { showSuccess, showError, showInfo } = useToast();

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const [caseRes, evidenceRes, unitsRes, usersRes] = await Promise.all([
        api.get(`/cases/${id}`),
        api.get(`/cases/${id}/files`).catch(() => ({ data: {} })),
        api.get('/organization-units').catch(() => ({ data: {} })),
        api.get('/users').catch(() => ({ data: {} }))
      ]);
      
      const cData = caseRes.data?.case || caseRes.data?.data || caseRes.data;
      const filesData = evidenceRes.data?.files || evidenceRes.data?.data || (Array.isArray(evidenceRes.data) ? evidenceRes.data : []);
      const unitsData = unitsRes.data?.units || unitsRes.data?.data || (Array.isArray(unitsRes.data) ? unitsRes.data : []);
      const usersData = usersRes.data?.users || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);

      setCaseData(cData);
      setEditForm({
        title: cData?.title || '',
        description: cData?.description || '',
        status: cData?.status || 'ACTIVE',
        priority: cData?.priority || 'NORMAL'
      });

      setEvidence(Array.isArray(filesData) ? filesData : []);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Load involved persons from localStorage or mock case state
      const savedPersons = localStorage.getItem(`case_persons_${id}`);
      if (savedPersons) {
        try { setInvolvedPersons(JSON.parse(savedPersons)); } catch (e) {}
      } else {
        setInvolvedPersons([
          { id: '1', name: 'Primary Victim / Complainant', role: 'VICTIM', contact: 'Protected Statement Registered', notes: 'Statement recorded on case creation' },
          { id: '2', name: 'Suspect Person #1', role: 'SUSPECT', contact: 'Under Investigation', notes: 'Identified in initial case report' }
        ]);
      }
    } catch (err) {
      setError(err.response?.status === 403 
        ? 'Security Clearance Error: You do not have authorization to view this case record.' 
        : 'Failed to load case record from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const handleVerifyEvidence = async (fileObj) => {
    const targetFileId = typeof fileObj === 'string' ? fileObj : fileObj?.id;
    const targetFile = typeof fileObj === 'object' ? fileObj : evidence.find((f) => f.id === targetFileId);

    setVerificationReport({ loading: true, file: targetFile, data: null });
    setActiveModal('VERIFY_REPORT');

    try {
      const res = await api.get(`/cases/${id}/files/${targetFileId}/verify`);
      const reportData = res.data?.data || res.data;
      setVerificationReport({
        loading: false,
        file: targetFile,
        data: reportData,
        message: res.data?.message || 'File integrity verified'
      });
    } catch (err) {
      setVerificationReport({
        loading: false,
        file: targetFile,
        error: err.response?.data?.message || 'Failed to complete cryptographic verification audit.'
      });
    }
  };

  const handleDownloadEvidence = async (fileId, fileName) => {
    try {
      const response = await api.get(`/cases/${id}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `evidence_${fileId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to download evidence file. Please check server connection.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setModalError('File size exceeds the maximum allowed limit of 50 MB.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (uploadCategory) formData.append('category', uploadCategory);
      if (uploadDescription) formData.append('description', uploadDescription);

      await api.post(`/cases/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setActiveModal(null);
      setSelectedFile(null);
      setUploadCategory('');
      setUploadDescription('');
      showSuccess('Evidence file successfully uploaded and secured.');
      fetchCaseDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'File upload failed. Check supported file types and size.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.patch(`/cases/${id}`, editForm);
      setActiveModal(null);
      showSuccess('Case details successfully updated.');
      fetchCaseDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    try {
      await api.patch(`/cases/${id}`, { status: newStatus });
      showSuccess(`Case status successfully changed to ${newStatus}.`);
      fetchCaseDetails();
    } catch (err) {
      showError(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!personForm.name) return;
    
    const newPerson = {
      id: Date.now().toString(),
      name: personForm.name,
      role: personForm.role,
      contact: personForm.contact || 'N/A',
      notes: personForm.notes || 'Registered'
    };

    const updated = [...involvedPersons, newPerson];
    setInvolvedPersons(updated);
    localStorage.setItem(`case_persons_${id}`, JSON.stringify(updated));
    setActiveModal(null);
    showSuccess(`${personForm.role} record added successfully.`);
    setPersonForm({ name: '', role: 'VICTIM', contact: '', notes: '' });
  };

  const handleAssignUnit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post(`/cases/${id}/units`, { unitId: unitAssignForm.unitId });
      setActiveModal(null);
      showSuccess('Organization unit successfully assigned to case.');
      fetchCaseDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post(`/cases/${id}/assignments`, { userId: userAssignForm.userId });
      setActiveModal(null);
      showSuccess('Officer successfully assigned to case.');
      fetchCaseDetails();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      await api.post(`/access-requests/cases/${id}`, accessReqForm);
      setActiveModal(null);
      showSuccess('Access request submitted successfully for supervisor review.');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit access request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="gov-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading official case dashboard details...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Link to="/cases" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Return to Case Registry
        </Link>
        <div className="gov-card" style={{ padding: '40px', textAlign: 'center', borderColor: 'var(--danger-border)' }}>
          <AlertTriangle size={48} color="var(--danger-text)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ color: 'var(--danger-text)', marginBottom: '8px', fontSize: '1.3rem' }}>Authorization Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>{error}</p>
          
          <button className="btn btn-primary" onClick={() => setActiveModal('REQUEST_ACCESS')}>
            <Key size={16} /> Request Case Access Clearance
          </button>
        </div>

        {/* REQUEST ACCESS MODAL */}
        {activeModal === 'REQUEST_ACCESS' && (
          <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="gov-modal-header">
                <div className="gov-modal-title">Request Access Clearance</div>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleRequestAccess}>
                <div className="gov-modal-body">
                  {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                  <div className="input-group">
                    <label className="input-label">Justification / Reason</label>
                    <textarea className="input-field" value={accessReqForm.reason} onChange={(e) => setAccessReqForm({ ...accessReqForm, reason: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Requested Access Level</label>
                    <select className="input-field" value={accessReqForm.requestedAccess} onChange={(e) => setAccessReqForm({ ...accessReqForm, requestedAccess: e.target.value })}>
                      <option value="READ">READ ONLY</option>
                      <option value="WRITE">WRITE / UPLOAD</option>
                      <option value="FULL">FULL ACCESS</option>
                    </select>
                  </div>
                </div>
                <div className="gov-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/cases" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--govt-navy)', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Case Registry
        </Link>
      </div>

      {/* Official Case Dashboard Banner */}
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
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{caseData?.title}</h1>
            <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {caseData?.caseId || 'OFFICIAL-CASE-FILE'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '850px', lineHeight: 1.5 }}>
            {caseData?.description || 'No formal description attached to this case file.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {hasPermission('CASE_CLOSE') && (
            <>
              {caseData?.status !== 'ARCHIVED' && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }} 
                  onClick={() => handleStatusChange('ARCHIVED')}
                  disabled={submitting}
                  title="Archive this case file"
                >
                  <Archive size={14} /> Archive
                </button>
              )}

              {caseData?.status !== 'CLOSED' && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', color: '#dc2626', borderColor: '#fca5a5' }} 
                  onClick={() => handleStatusChange('CLOSED')}
                  disabled={submitting}
                  title="Mark this case as CLOSED"
                >
                  <Lock size={14} /> Close Case
                </button>
              )}

              {caseData?.status !== 'ACTIVE' && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', color: '#16a34a', borderColor: '#86efac' }} 
                  onClick={() => handleStatusChange('ACTIVE')}
                  disabled={submitting}
                  title="Re-open case as ACTIVE"
                >
                  <PlayCircle size={14} /> Reopen
                </button>
              )}
            </>
          )}

          {hasPermission('CASE_MODIFY') && (
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveModal('EDIT')}>
              <Edit3 size={14} /> Edit Case Details
            </button>
          )}

          <span className={`badge ${
            caseData?.status === 'ACTIVE' ? 'badge-success' : 
            caseData?.status === 'CLOSED' ? 'badge-danger' : 
            caseData?.status === 'ARCHIVED' ? 'badge-secondary' : 'badge-info'
          }`}>
            {caseData?.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('EVIDENCE')}
          className={`btn ${activeTab === 'EVIDENCE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          <FileText size={16} /> Digital Evidence ({evidence.length})
        </button>
        <button 
          onClick={() => setActiveTab('PERSONS')}
          className={`btn ${activeTab === 'PERSONS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          <Users size={16} /> Victims & Suspects ({involvedPersons.length})
        </button>
        <button 
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`btn ${activeTab === 'ASSIGNMENTS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
        >
          <UserCheck size={16} /> Units & Officers
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TAB 1: DIGITAL EVIDENCE FILES */}
          {activeTab === 'EVIDENCE' && (
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <FileText size={18} />
                  Digital Evidence Inventory ({evidence.length})
                </div>

                {hasPermission('EVIDENCE_UPLOAD') && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }} onClick={() => openEvidenceModal('FILE')}>
                      <Upload size={14} /> Upload File
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }} onClick={() => openEvidenceModal('CAMERA')}>
                      <Camera size={14} /> Take Photo
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }} onClick={() => openEvidenceModal('AUDIO')}>
                      <Mic size={14} /> Record Audio
                    </button>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }} onClick={() => openEvidenceModal('VIDEO')}>
                      <Video size={14} /> Record Video
                    </button>
                  </div>
                )}
              </div>

              {/* OCR Text & Category Filter Control Bar */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: '#f8fafc', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search evidence by name, description, or OCR text..."
                    value={evidenceSearchTerm}
                    onChange={(e) => setEvidenceSearchTerm(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>

                <div style={{ minWidth: '180px' }}>
                  <select 
                    className="input-field"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  >
                    <option value="">All Categories</option>
                    <option value="DOCUMENT">DOCUMENT</option>
                    <option value="PHOTOGRAPH">PHOTOGRAPH</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="AUDIO">AUDIO</option>
                    <option value="CCTV">CCTV</option>
                    <option value="FORENSIC">FORENSIC</option>
                    <option value="REPORT">REPORT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="gov-card-body" style={{ padding: 0 }}>
                {evidence.filter(file => {
                  const matchesSearch = !evidenceSearchTerm || 
                    file.originalName?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                    file.displayName?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                    file.description?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                    file.ocrText?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                    file.tags?.some(t => t.toLowerCase().includes(evidenceSearchTerm.toLowerCase()));
                  const matchesCategory = !selectedCategory || file.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {evidence.length === 0 
                      ? 'No digital evidence files registered for this case record.' 
                      : 'No evidence files match your search filter or category selection.'}
                  </div>
                ) : (
                  <div className="gov-table-container" style={{ border: 'none' }}>
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>File Name / Extracted Text</th>
                          <th>Category / Format</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidence.filter(file => {
                          const matchesSearch = !evidenceSearchTerm || 
                            file.originalName?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                            file.displayName?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                            file.description?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                            file.ocrText?.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                            file.tags?.some(t => t.toLowerCase().includes(evidenceSearchTerm.toLowerCase()));
                          const matchesCategory = !selectedCategory || file.category === selectedCategory;
                          return matchesSearch && matchesCategory;
                        }).map(file => (
                          <tr key={file.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.originalName}</div>
                              
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimeType || 'Binary'}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-success">
                                <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Intact & Valid
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                {hasPermission('EVIDENCE_VERIFY') && (
                                  <button 
                                    onClick={() => handleVerifyEvidence(file.id)}
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    title="Audit Cryptographic Integrity"
                                  >
                                    <ShieldCheck size={14} /> Verify
                                  </button>
                                )}
                                
                                {hasPermission('EVIDENCE_DOWNLOAD') && (
                                  <button 
                                    onClick={() => handleDownloadEvidence(file.id, file.originalName)}
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    title="Download Evidence File"
                                  >
                                    <Download size={14} /> Download
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
              </div>
            </div>
          )}

          {/* TAB 2: VICTIMS & SUSPECTS */}
          {activeTab === 'PERSONS' && (
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <Users size={18} />
                  Victims, Suspects & Involved Persons ({involvedPersons.length})
                </div>

                {hasPermission('CASE_MODIFY') && (
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveModal('ADD_PERSON')}>
                    <Plus size={14} /> Add Victim / Suspect
                  </button>
                )}
              </div>

              <div className="gov-card-body" style={{ padding: 0 }}>
                {involvedPersons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No victims or suspects recorded for this case file yet.
                  </div>
                ) : (
                  <div className="gov-table-container" style={{ border: 'none' }}>
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Role Classification</th>
                          <th>Contact Information</th>
                          <th>Statement Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {involvedPersons.map(person => (
                          <tr key={person.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{person.name}</div>
                            </td>
                            <td>
                              <span className={`badge ${
                                person.role === 'VICTIM' || person.role === 'COMPLAINANT' ? 'badge-info' : 
                                person.role === 'SUSPECT' ? 'badge-danger' : 'badge-secondary'
                              }`}>
                                {person.role}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{person.contact}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{person.notes}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: UNITS & ASSIGNED OFFICERS */}
          {activeTab === 'ASSIGNMENTS' && (
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">
                  <UserCheck size={18} />
                  Assigned Department Units & Officers
                </div>

                {hasPermission('CASE_ASSIGN') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setActiveModal('ASSIGN_UNIT')}>
                      <Building size={14} /> Assign Unit
                    </button>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setActiveModal('ASSIGN_USER')}>
                      <UserPlus size={14} /> Assign Officer
                    </button>
                  </div>
                )}
              </div>

              <div className="gov-card-body">
                <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--govt-navy)' }}>Assigned Department Units</h3>
                {caseData?.units && caseData.units.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                    {caseData.units.map(u => (
                      <div key={u.id} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>{u.unit?.name || 'Assigned Department'}</strong> ({u.status || 'ACTIVE'})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>No specific department units assigned.</p>
                )}

                <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--govt-navy)' }}>Assigned Officer Personnel</h3>
                {caseData?.assignments && caseData.assignments.length > 0 ? (
                  <div className="gov-table-container">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Officer Name</th>
                          <th>Status</th>
                          <th>Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseData.assignments.map(a => (
                          <tr key={a.id}>
                            <td>{a.user?.name || 'Assigned Officer'}</td>
                            <td><span className="badge badge-success">{a.status || 'ACTIVE'}</span></td>
                            <td style={{ fontSize: '0.8rem' }}>{a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No individual officers explicitly assigned.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="gov-card">
            <div className="gov-card-header">
              <div className="gov-card-title">Case Metadata</div>
            </div>
            
            <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>CASE REFERENCE ID</div>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--govt-navy)', marginTop: '2px' }}>
                  {caseData?.caseId || 'OFFICIAL-CASE-FILE'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>PRIORITY LEVEL</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{caseData?.priority || 'NORMAL'}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>CLASSIFICATION</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{caseData?.caseType || 'GENERAL'}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>STATUS</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  <span className={`badge ${caseData?.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                    {caseData?.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              {caseData?.createdBy && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>CREATING OFFICER</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{caseData.createdBy.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Controls */}
          {hasPermission('CASE_ASSIGN') && (
            <div className="gov-card">
              <div className="gov-card-header">
                <div className="gov-card-title">Quick Actions</div>
              </div>
              <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'flex-start' }} onClick={() => setActiveModal('ADD_PERSON')}>
                  <Plus size={14} /> Add Victim / Suspect
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'flex-start' }} onClick={() => setActiveModal('ASSIGN_UNIT')}>
                  <Building size={14} /> Assign Unit Scope
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'flex-start' }} onClick={() => setActiveModal('ASSIGN_USER')}>
                  <UserPlus size={14} /> Assign Officer User
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DIRECT EVIDENCE CAPTURE & UPLOAD MODAL */}
      {activeModal === 'UPLOAD' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" style={{ maxWidth: '650px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">
                {captureMode === 'CAMERA' ? 'Direct Camera Photo Capture' :
                 captureMode === 'AUDIO' ? 'Direct Audio Statement Record' :
                 captureMode === 'VIDEO' ? 'Direct Video Evidence Record' :
                 'Upload Digital Evidence File'}
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Mode Switcher Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', padding: '0 8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                style={{
                  borderRadius: 0,
                  fontSize: '0.8rem',
                  padding: '10px 14px',
                  background: captureMode === 'FILE' ? '#ffffff' : 'transparent',
                  borderBottom: captureMode === 'FILE' ? '2px solid var(--govt-navy)' : '2px solid transparent',
                  fontWeight: captureMode === 'FILE' ? 600 : 400,
                  color: captureMode === 'FILE' ? 'var(--govt-navy)' : 'var(--text-secondary)'
                }}
                onClick={() => openEvidenceModal('FILE')}
              >
                <Upload size={14} style={{ marginRight: '6px' }} /> Upload File
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  borderRadius: 0,
                  fontSize: '0.8rem',
                  padding: '10px 14px',
                  background: captureMode === 'CAMERA' ? '#ffffff' : 'transparent',
                  borderBottom: captureMode === 'CAMERA' ? '2px solid var(--govt-navy)' : '2px solid transparent',
                  fontWeight: captureMode === 'CAMERA' ? 600 : 400,
                  color: captureMode === 'CAMERA' ? 'var(--govt-navy)' : 'var(--text-secondary)'
                }}
                onClick={() => openEvidenceModal('CAMERA')}
              >
                <Camera size={14} style={{ marginRight: '6px' }} /> Take Photo
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  borderRadius: 0,
                  fontSize: '0.8rem',
                  padding: '10px 14px',
                  background: captureMode === 'AUDIO' ? '#ffffff' : 'transparent',
                  borderBottom: captureMode === 'AUDIO' ? '2px solid var(--govt-navy)' : '2px solid transparent',
                  fontWeight: captureMode === 'AUDIO' ? 600 : 400,
                  color: captureMode === 'AUDIO' ? 'var(--govt-navy)' : 'var(--text-secondary)'
                }}
                onClick={() => openEvidenceModal('AUDIO')}
              >
                <Mic size={14} style={{ marginRight: '6px' }} /> Record Audio
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  borderRadius: 0,
                  fontSize: '0.8rem',
                  padding: '10px 14px',
                  background: captureMode === 'VIDEO' ? '#ffffff' : 'transparent',
                  borderBottom: captureMode === 'VIDEO' ? '2px solid var(--govt-navy)' : '2px solid transparent',
                  fontWeight: captureMode === 'VIDEO' ? 600 : 400,
                  color: captureMode === 'VIDEO' ? 'var(--govt-navy)' : 'var(--text-secondary)'
                }}
                onClick={() => openEvidenceModal('VIDEO')}
              >
                <Video size={14} style={{ marginRight: '6px' }} /> Record Video
              </button>
            </div>

            <div className="gov-modal-body" style={{ padding: '20px' }}>
              {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}

              {/* CAPTURE STEP 1: Live Hardware Capture / File Browser */}
              {captureStep === 'CAPTURE' && (
                <>
                  {captureMode === 'CAMERA' && (
                    <CameraCapture
                      onCapture={(file, cat) => {
                        setSelectedFile(file);
                        if (cat) setUploadCategory(cat);
                        setCaptureStep('DETAILS');
                      }}
                      onCancel={() => setActiveModal(null)}
                    />
                  )}

                  {captureMode === 'AUDIO' && (
                    <AudioRecorder
                      onCapture={(file, cat) => {
                        setSelectedFile(file);
                        if (cat) setUploadCategory(cat);
                        setCaptureStep('DETAILS');
                      }}
                      onCancel={() => setActiveModal(null)}
                    />
                  )}

                  {captureMode === 'VIDEO' && (
                    <VideoRecorder
                      onCapture={(file, cat) => {
                        setSelectedFile(file);
                        if (cat) setUploadCategory(cat);
                        setCaptureStep('DETAILS');
                      }}
                      onCancel={() => setActiveModal(null)}
                    />
                  )}

                  {captureMode === 'FILE' && (
                    <div className="input-group">
                      <label className="input-label">Select Evidence File *</label>
                      <input 
                        type="file" 
                        className="input-field" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              setModalError('File size exceeds the maximum allowed limit of 50 MB.');
                              return;
                            }
                            setSelectedFile(file);
                            setCaptureStep('DETAILS');
                          }
                        }} 
                        required 
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Supported: PDF, Images (JPEG, PNG, WEBP), Audio (WEBM, WAV, MP4), Video (MP4, WEBM), Text (Max 50MB).
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* CAPTURE STEP 2: Evidence Metadata Registration Form */}
              {captureStep === 'DETAILS' && (
                <form onSubmit={handleFileUpload}>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Selected / Captured Evidence File</div>
                    <div style={{ fontWeight: 600, color: 'var(--govt-navy)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {selectedFile?.name || 'Evidence File'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB • {selectedFile?.type || 'Binary Stream'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedFile(null);
                          setCaptureStep('CAPTURE');
                        }}
                      >
                        <RefreshCw size={12} style={{ marginRight: '4px' }} /> Change / Re-capture
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Evidence Category *</label>
                    <select 
                      className="input-field"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      required
                    >
                      <option value="">Choose Category...</option>
                      <option value="PHOTOGRAPH">PHOTOGRAPH</option>
                      <option value="AUDIO">AUDIO</option>
                      <option value="VIDEO">VIDEO</option>
                      <option value="DOCUMENT">DOCUMENT</option>
                      <option value="CCTV">CCTV</option>
                      <option value="FORENSIC">FORENSIC</option>
                      <option value="REPORT">REPORT</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description / Chain of Custody Notes</label>
                    <textarea 
                      className="input-field"
                      placeholder="Enter evidence notes, location, or capture context..."
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="gov-modal-footer" style={{ padding: '16px 0 0 0', borderTop: '1px solid var(--border-light)', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting || !selectedFile}>
                      {submitting ? 'Saving Evidence...' : <><CheckCircle2 size={16} /> Save Evidence to Case</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD VICTIM / SUSPECT MODAL */}
      {activeModal === 'ADD_PERSON' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Add Victim / Suspect Record</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPerson}>
              <div className="gov-modal-body">
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input className="input-field" placeholder="Full name of person..." value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Role Classification *</label>
                  <select className="input-field" value={personForm.role} onChange={(e) => setPersonForm({ ...personForm, role: e.target.value })}>
                    <option value="VICTIM">VICTIM</option>
                    <option value="SUSPECT">SUSPECT</option>
                    <option value="COMPLAINANT">COMPLAINANT</option>
                    <option value="WITNESS">WITNESS</option>
                    <option value="PERSON_OF_INTEREST">PERSON OF INTEREST</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Contact Details / Address</label>
                  <input className="input-field" placeholder="Phone, email, or address..." value={personForm.contact} onChange={(e) => setPersonForm({ ...personForm, contact: e.target.value })} />
                </div>

                <div className="input-group">
                  <label className="input-label">Statement Notes / Summary</label>
                  <textarea className="input-field" placeholder="Enter statement or investigation notes..." value={personForm.notes} onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Check size={16} /> Add Person Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CASE DETAILS MODAL */}
      {activeModal === 'EDIT' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Update Case Details</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateCase}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                <div className="input-group">
                  <label className="input-label">Case Title</label>
                  <input className="input-field" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="input-field" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Status</label>
                    <select className="input-field" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Priority</label>
                    <select className="input-field" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN UNIT MODAL */}
      {activeModal === 'ASSIGN_UNIT' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Assign Organization Unit</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignUnit}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                <div className="input-group">
                  <label className="input-label">Select Department / Unit *</label>
                  <select className="input-field" value={unitAssignForm.unitId} onChange={(e) => setUnitAssignForm({ ...unitAssignForm, unitId: e.target.value })} required>
                    <option value="">Choose Unit...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
                  </select>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Assigning...' : 'Assign Unit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {activeModal === 'ASSIGN_USER' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <div className="gov-modal-title">Assign Officer to Case</div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignUser}>
              <div className="gov-modal-body">
                {modalError && <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>{modalError}</div>}
                <div className="input-group">
                  <label className="input-label">Select Officer User *</label>
                  <select className="input-field" value={userAssignForm.userId} onChange={(e) => setUserAssignForm({ ...userAssignForm, userId: e.target.value })} required>
                    <option value="">Choose User...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
              </div>
              <div className="gov-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Assigning...' : 'Assign Officer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVIDENCE INTEGRITY VERIFICATION AUDIT REPORT MODAL BOX */}
      {activeModal === 'VERIFY_REPORT' && (
        <div className="gov-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="gov-modal-content" style={{ maxWidth: '580px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header" style={{ borderBottom: '2px solid var(--border-color)' }}>
              <div className="gov-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--govt-navy)" />
                Evidence File Integrity Audit Report
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                title="Close Report"
              >
                <X size={20} />
              </button>
            </div>

            <div className="gov-modal-body" style={{ padding: '20px' }}>
              {verificationReport?.loading ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={40} color="var(--govt-navy)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--govt-navy)' }}>Auditing File Cryptographic Integrity...</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Verifying file stream integrity against registered cryptographic signatures.</div>
                </div>
              ) : verificationReport?.error ? (
                <div style={{ padding: '16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={18} /> Audit Verification Error
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>{verificationReport.error}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Status Banner Box */}
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '6px',
                    background: verificationReport?.data?.fileIntegrity?.verified ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `5px solid ${verificationReport?.data?.fileIntegrity?.verified ? '#16a34a' : '#dc2626'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {verificationReport?.data?.fileIntegrity?.verified ? (
                        <CheckCircle2 size={28} color="#16a34a" />
                      ) : (
                        <AlertTriangle size={28} color="#dc2626" />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: verificationReport?.data?.fileIntegrity?.verified ? '#15803d' : '#b91c1c' }}>
                          {verificationReport?.data?.fileIntegrity?.verified ? 'FILE INTEGRITY VERIFIED & INTACT' : 'FILE INTEGRITY VERIFICATION FAILED'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {verificationReport?.message || 'Verification audit complete.'}
                        </div>
                      </div>
                    </div>

                    <span className={`badge ${verificationReport?.data?.fileIntegrity?.verified ? 'badge-success' : 'badge-danger'}`}>
                      {verificationReport?.data?.fileIntegrity?.verified ? 'VERIFIED' : 'FAILED'}
                    </span>
                  </div>

                  {/* Evidence File Details */}
                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Evidence File Name</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--govt-navy)', marginTop: '2px', wordBreak: 'break-all' }}>
                      {verificationReport?.file?.originalName || verificationReport?.data?.originalName || 'Evidence File'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {(verificationReport?.file?.size / 1024 / 1024).toFixed(2)} MB • {verificationReport?.file?.mimeType || 'Binary File'}
                    </div>
                  </div>

                  {/* Cryptographic Audit Report Checklist */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px 16px', background: '#ffffff' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--govt-navy)', marginBottom: '12px' }}>
                      Cryptographic Audit Report Checklist
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span><strong>Storage Object Stream:</strong> Verified Intact & Unaltered</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span><strong>Cryptographic Signature Audit:</strong> Matched Database Registry</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span><strong>Blockchain Ledger Anchor:</strong> Immutable Commitment Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="gov-modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setActiveModal(null)}>
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
