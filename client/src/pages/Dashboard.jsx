import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Shield, FileText, Users, Activity, Building, Clock } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCases: 0,
    totalUsers: 0,
    totalUnits: 0,
    totalAuditLogs: 0
  });
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [casesRes, usersRes, unitsRes, auditRes] = await Promise.all([
          api.get('/cases').catch(() => ({ data: [] })),
          api.get('/users').catch(() => ({ data: [] })),
          api.get('/organization-units').catch(() => ({ data: [] })),
          api.get('/audit-logs').catch(() => ({ data: [] }))
        ]);

        const casesList = casesRes?.data?.data || casesRes?.data || [];
        const usersList = usersRes?.data?.data || usersRes?.data || [];
        const unitsList = unitsRes?.data?.data || unitsRes?.data || [];
        const auditList = auditRes?.data?.data || auditRes?.data || [];

        setStats({
          activeCases: Array.isArray(casesList) ? casesList.filter(c => c && (c.status === 'ACTIVE' || !c.status)).length : 0,
          totalUsers: Array.isArray(usersList) ? usersList.length : 0,
          totalUnits: Array.isArray(unitsList) ? unitsList.length : 0,
          totalAuditLogs: Array.isArray(auditList) ? auditList.length : 0
        });

        setRecentAuditLogs(Array.isArray(auditList) ? auditList.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Active Cases Assigned', value: loading ? '...' : stats.activeCases.toString(), icon: FileText, badge: 'Live Registry', badgeType: 'success' },
    { label: 'System Users Authorized', value: loading ? '...' : stats.totalUsers.toString(), icon: Users, badge: 'Verified Accounts', badgeType: 'info' },
    { label: 'Organization Units', value: loading ? '...' : stats.totalUnits.toString(), icon: Building, badge: 'Active Units', badgeType: 'secondary' },
    { label: 'Recorded Audit Events', value: loading ? '...' : stats.totalAuditLogs.toString(), icon: Activity, badge: 'Zero-Trust Logs', badgeType: 'warning' },
  ];

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
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Administrative Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Live metrics and operational overview of your organizational unit.
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div><strong>Officer:</strong> {user?.name || 'Authorized Officer'}</div>
          <div><strong>Department:</strong> {user?.organizationUnit?.name || 'Central Unit'}</div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '28px'
      }}>
        {statCards.map((stat, i) => (
          <div key={i} className="gov-card">
            <div className="gov-card-body" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ 
                  background: '#f1f5f9', 
                  padding: '10px', 
                  borderRadius: '4px',
                  color: 'var(--govt-navy)',
                  display: 'flex'
                }}>
                  <stat.icon size={22} />
                </div>
                <span className={`badge badge-${stat.badgeType}`}>
                  {stat.badge}
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--govt-navy)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live System Status / Audit Trail Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <Clock size={18} />
              Recent Audit Log Activity
            </div>
          </div>
          <div className="gov-card-body" style={{ padding: 0 }}>
            {recentAuditLogs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No audit log records captured yet.
              </div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Target Resource</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.user?.name || log.userId || 'Officer'}</div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{log.resource || log.entityId || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title">
              <Shield size={18} />
              Security Compliance Policy
            </div>
          </div>
          <div className="gov-card-body" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>Zero-Trust Boundary Enforced:</strong> All access requests, evidence downloads, and unit assignments are evaluated dynamically against scope boundaries.
            </p>
            <p>
              Every transaction is signed and permanently logged in audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
