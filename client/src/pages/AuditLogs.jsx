import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data.data || response.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have official authorization clearance to view security audit logs.');
      } else if (err.response?.status === 401) {
        setError('Session Expired: Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch zero-trust audit trail logs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Zero-Trust Audit Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Official audit trail of administrative access decisions, permission evaluations, and system actions.
          </p>
        </div>

        <button onClick={fetchAuditLogs} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
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
          Retrieving audit trail records...
        </div>
      ) : (
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <ShieldAlert size={18} /> Audit Trail Log Records ({logs.length})
            </div>
          </div>

          <div className="gov-card-body" style={{ padding: 0 }}>
            <div className="gov-table-container" style={{ border: 'none' }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Actor</th>
                    <th>Action</th>
                    <th>Resource / Target</th>
                    <th>IP Address / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No audit log entries found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.user?.name || 'Authorized Officer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.user?.email || 'Officer Account'}</div>
                        </td>
                        <td>
                          <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{log.resource || log.entityId || '-'}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
