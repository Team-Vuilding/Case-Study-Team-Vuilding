import React, { useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonHeading, SkeletonList, SkeletonSummary } from '../WorkspaceSkeletons';
import { hasPermission, PERMISSIONS } from '../../data/rbac';

const ROLES = [
  { value: 'admin', label: 'Admin', department: 'System & User Management', summary: 'Users, inventory catalog, oversight, purchasing approvals' },
  { value: 'warehouse', label: 'Warehouse Staff', department: 'Warehouse Operations', summary: 'Stock movement, physical counts, reconciliation' },
  { value: 'purchasing', label: 'Purchasing Manager', department: 'Procurement & Supply Chain', summary: 'Suppliers, purchase orders, reorder points, forecasts' },
  { value: 'sales', label: 'Sales Staff', department: 'Sales & Customer Service', summary: 'Read-only pricing, availability, and categories' },
];

const emptyForm = { name: '', email: '', accessLevel: 'warehouse', password: '' };
const initialsFor = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

export default function ManageAccountsSection({ currentUser }) {
  const authorized = hasPermission(currentUser?.accessLevel, PERMISSIONS.MANAGE_ACCOUNTS);
  const users = useApiData('users');
  const events = useApiData('users/activity-logs');
  const accounts = users.data || [];
  const activity = events.data || [];
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Confirmation modal state for 30-day deactivation
  const [accountToDeactivate, setAccountToDeactivate] = useState(null);
  const [isDeactivatingAccount, setIsDeactivatingAccount] = useState(false);

  if (!authorized) return <div className="wba-glow-card">Access denied.</div>;

  const refresh = refreshData;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (account) => {
    setEditingId(account.id);
    setForm({ name: account.name, email: account.email, accessLevel: account.accessLevel, password: '' });
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!hasPermission(currentUser?.accessLevel, PERMISSIONS.MANAGE_ACCOUNTS)) return;
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const role = ROLES.find((item) => item.value === form.accessLevel);
    if (!name || !email || !role) return setError('Complete the name, email, and role.');
    if (accounts.some((account) => account.id !== editingId && account.email.toLowerCase() === email)) {
      return setError('This email already belongs to another account.');
    }
    if (!editingId && form.password.length < 12) return setError('New accounts need a password of at least 12 characters.');
    if (editingId && form.password && form.password.length < 12) return setError('A replacement password needs at least 12 characters.');
    if (editingId === currentUser.id && form.accessLevel !== currentUser.accessLevel) {
      return setError('You cannot change your own role.');
    }

    try {
      await apiRequest(editingId ? 'users/' + editingId : 'users', {
        method: editingId ? 'PUT' : 'POST',
        body: {
          name,
          email,
          accessLevel: role.value,
          ...(form.password ? { password: form.password } : {}),
        },
      });
      refresh();
      setIsFormOpen(false);
      setNotice(`${name} ${editingId ? 'updated' : 'added'} successfully.`);
    } catch (reason) {
      setError(reason.message);
    }
  };

  const confirmDeactivate = (account) => {
    if (account.id === currentUser.id) {
      setNotice('You cannot deactivate your own account here.');
      return;
    }
    setAccountToDeactivate({ ...account, recoveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    }) });
  };

  const executeDeactivation = async () => {
    if (!accountToDeactivate || isDeactivatingAccount) return;
    setIsDeactivatingAccount(true);
    try {
      await apiRequest('users/' + accountToDeactivate.id, { method: 'DELETE' });
      refresh();
      setNotice(`${accountToDeactivate.name}'s account has been deactivated. 30-day recovery period initiated.`);
      setAccountToDeactivate(null);
    } catch (reason) {
      setNotice(reason.message);
    } finally {
      setIsDeactivatingAccount(false);
    }
  };

  const handleReactivate = async (account) => {
    if (!hasPermission(currentUser?.accessLevel, PERMISSIONS.MANAGE_ACCOUNTS)) return;
    try {
      await apiRequest('users/' + account.id + '/reactivate', { method: 'POST' });
      refresh();
      setNotice(`${account.name}'s account has been successfully reactivated.`);
    } catch (reason) {
      setNotice(reason.message);
    }
  };

  if (users.loading || users.error || events.loading || events.error) {
    return (
      <ApiStatus
        loading={users.loading || events.loading}
        loadingLabel="Loading accounts and account activity…"
        error={users.error || events.error}
        onRetry={() => {
          users.reload();
          events.reload();
        }}
      >
        <div className="wba-grid-container">
          <SkeletonHeading />
          <SkeletonSummary />
          <SkeletonList avatar />
          <SkeletonList />
        </div>
      </ApiStatus>
    );
  }

  const visibleAccounts = accounts.filter(
    (account) =>
      (roleFilter === 'all' || account.accessLevel === roleFilter) &&
      `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeAccountsCount = accounts.filter((account) => account.status === 'active' || account.isActive).length;
  const deactivatedAccountsCount = accounts.filter((account) => account.status === 'deactivated' || !account.isActive).length;

  return (
    <div className="wba-grid-container wba-accounts-page">
      <div className="wba-section-page-header">
        <div>
          <h2 className="wba-section-page-title">Manage Accounts</h2>
          <p className="wba-section-page-desc">Create accounts, assign fixed roles, review deactivation recovery periods, and audit account activity.</p>
        </div>
        <button type="button" className="wba-btn-primary" onClick={openCreate}>
          + Add user
        </button>
      </div>

      {notice && <p className="wba-accounts-notice" role="status">{notice}</p>}

      <section className="wba-accounts-summary" aria-label="Account summary">
        <div>
          <span>Total users</span>
          <strong>{accounts.length}</strong>
        </div>
        <div>
          <span>Active users</span>
          <strong style={{ color: '#34d399' }}>{activeAccountsCount}</strong>
        </div>
        <div>
          <span>In 30-Day Recovery</span>
          <strong style={{ color: '#fbbf24' }}>{deactivatedAccountsCount}</strong>
        </div>
      </section>

      <section className="wba-glow-card wba-accounts-card">
        <div className="wba-accounts-section-head">
          <div>
            <h3>User directory</h3>
            <p>Search or filter system accounts and monitor deactivation recovery states.</p>
          </div>
          <div className="wba-accounts-filters">
            <input
              className="wba-input-field"
              type="search"
              aria-label="Search users"
              placeholder="Search name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="wba-input-field"
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="wba-accounts-list">
          {visibleAccounts.length === 0 && <p className="wba-accounts-empty">No accounts match your search.</p>}
          {visibleAccounts.map((account) => {
            const isDeactivated = account.status === 'deactivated' || !account.isActive;
            const daysLeft = account.remainingDays !== null ? account.remainingDays : 30;
            const deletionDateStr = account.deletionAt
              ? new Date(account.deletionAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'in 30 days';

            return (
              <div className="wba-account-row" key={account.id}>
                <span className="wba-account-avatar" aria-hidden="true">
                  {account.initials || initialsFor(account.name)}
                </span>
                <div className="wba-account-identity">
                  <strong>{account.name}</strong>
                  <span>{account.email}</span>
                </div>
                <span className="wba-account-role">{account.role}</span>
                <span
                  className={`wba-account-status ${isDeactivated ? 'inactive' : 'active'}`}
                  title={isDeactivated ? `Scheduled permanent deletion: ${deletionDateStr}` : 'Account is active'}
                >
                  {isDeactivated ? `Deactivated · ${daysLeft}d left` : 'Active'}
                </span>
                <div className="wba-account-actions">
                  <button type="button" onClick={() => openEdit(account)}>
                    Edit
                  </button>
                  {isDeactivated ? (
                    <button
                      type="button"
                      style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                      onClick={() => handleReactivate(account)}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => confirmDeactivate(account)}
                      disabled={account.id === currentUser.id}
                      title={account.id === currentUser.id ? 'You cannot deactivate yourself' : 'Initiate 30-day deactivation'}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="wba-glow-card wba-accounts-card">
        <div className="wba-accounts-section-head">
          <div>
            <h3>Account activity</h3>
            <p>Recent sign-ins, deactivations, reactivations, and account purges recorded by the server.</p>
          </div>
        </div>
        <div className="wba-account-activity">
          {activity.length === 0 && <p className="wba-accounts-empty">No account activity yet.</p>}
          {activity.slice(0, 10).map((entry) => (
            <div key={entry.id}>
              <strong>{entry.action}</strong>
              <span>
                {entry.target} · {entry.actor}
              </span>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </div>
          ))}
        </div>
      </section>

      {/* Add / Edit User Modal */}
      {isFormOpen && (
        <div className="wba-dash-modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div
            className="wba-dash-modal-card wba-account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wba-account-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="wba-modal-close-btn"
              aria-label="Close account form"
              onClick={() => setIsFormOpen(false)}
            >
              &times;
            </button>
            <h2 id="wba-account-form-title">{editingId ? 'Edit account' : 'Add user'}</h2>
            <p className="wba-accounts-form-intro">Choose a role to apply its approved page and action permissions.</p>
            <form onSubmit={handleSave} className="wba-account-form">
              <label className="wba-input-group">
                <span className="wba-input-label">Full name</span>
                <input
                  className="wba-input-field"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label className="wba-input-group">
                <span className="wba-input-label">Work email</span>
                <input
                  className="wba-input-field"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>
              <label className="wba-input-group">
                <span className="wba-input-label">Role</span>
                <select
                  className="wba-input-field"
                  value={form.accessLevel}
                  disabled={editingId === currentUser.id}
                  onChange={(event) => setForm({ ...form, accessLevel: event.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wba-input-group">
                <span className="wba-input-label">{editingId ? 'New password (optional)' : 'Temporary password'}</span>
                <input
                  className="wba-input-field"
                  type="password"
                  minLength={12}
                  required={!editingId}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                />
              </label>
              <p className="wba-accounts-role-help">{ROLES.find((role) => role.value === form.accessLevel)?.summary}</p>
              {error && <p className="wba-modal-error" role="alert">{error}</p>}
              <div className="wba-accounts-form-actions">
                <button type="button" className="wba-pill-btn" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="wba-btn-primary">
                  {editingId ? 'Save changes' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Deactivation Confirmation Modal */}
      {accountToDeactivate && (
        <div className="wba-dash-modal-overlay" onClick={() => setAccountToDeactivate(null)}>
          <div
            className="wba-dash-modal-card"
            style={{ maxWidth: '480px', border: '1.5px solid rgba(245, 158, 11, 0.45)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-deactivate-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="wba-modal-close-btn"
              onClick={() => setAccountToDeactivate(null)}
              aria-label="Close modal"
            >
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <h2 id="admin-deactivate-title" style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>
                Confirm Account Deactivation
              </h2>
            </div>

            <p style={{ color: '#d1d5db', fontSize: '0.88rem', margin: '12px 0 6px 0', lineHeight: 1.5 }}>
              Are you sure you want to deactivate <strong>{accountToDeactivate.name}</strong> ({accountToDeactivate.email})?
            </p>

            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.82rem',
                color: '#fef3c7',
                lineHeight: 1.5,
                margin: '12px 0 16px 0',
              }}
            >
              <strong>30-Day Recovery Policy:</strong>
              <div style={{ marginTop: '4px' }}>
                The account will immediately lose access. They will have <strong>30 days</strong> to recover their account. If not reactivated by <strong>{accountToDeactivate.recoveryDeadline}</strong>, it becomes eligible for permanent deletion.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="wba-pill-btn"
                onClick={() => setAccountToDeactivate(null)}
                disabled={isDeactivatingAccount}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wba-btn-primary"
                style={{ background: '#dc2626', borderColor: '#ef4444' }}
                onClick={executeDeactivation}
                disabled={isDeactivatingAccount}
              >
                {isDeactivatingAccount ? 'Deactivating…' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
