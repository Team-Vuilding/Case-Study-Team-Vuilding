import React, { useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import WorkspaceDialog from '../WorkspaceDialog';
import { SkeletonHeading, SkeletonList, SkeletonSummary } from '../WorkspaceSkeletons';
import { hasPermission, PERMISSIONS } from '../../data/rbac';
import './form-and-alerts.css';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation modal state for 30-day deactivation
  const [accountToDeactivate, setAccountToDeactivate] = useState(null);
  const [isDeactivatingAccount, setIsDeactivatingAccount] = useState(false);

  if (!authorized) return <div className="wba-glow-card">Access denied.</div>;

  const refresh = refreshData;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (account) => {
    setEditingId(account.id);
    setForm({ name: account.name, email: account.email, accessLevel: account.accessLevel, password: '' });
    setShowPassword(false);
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (isSaving) return;
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

    setIsSaving(true);
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
      setNotice(`${name} ${editingId ? 'updated' : 'added'}.`);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setIsSaving(false);
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
      setNotice(`${account.name}'s account reactivated.`);
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
          <h2 className="wba-section-page-title wba-toolbar-title">Manage Accounts</h2>
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
          <strong className="wba-status-good">{activeAccountsCount}</strong>
        </div>
        <div>
          <span>In 30-Day Recovery</span>
          <strong className="wba-status-warning">{deactivatedAccountsCount}</strong>
        </div>
      </section>

      <section className="wba-glow-card wba-accounts-card">
        <div className="wba-accounts-section-head">
          <div>
            <h3>User directory</h3>
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
                      className="wba-status-good"
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
          </div>
        </div>
        <div className="wba-account-activity">
          {activity.length === 0 && <p className="wba-accounts-empty">No account activity yet.</p>}
          {activity.slice(0, 10).map((entry) => (
            <div key={entry.id}>
              <span className="wba-account-activity-identity">
                {entry.target} · {entry.actor}
              </span>
              <strong>{entry.action}</strong>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </div>
          ))}
        </div>
      </section>

      {/* Add / Edit User Modal */}
      {isFormOpen && (
        <WorkspaceDialog onClose={() => setIsFormOpen(false)} labelledBy="wba-account-form-title" className="wba-account-modal" busy={isSaving}>
            <h2 id="wba-account-form-title">{editingId ? 'Edit account' : 'Add user'}</h2>
            <form onSubmit={handleSave} className="wba-account-form" autoComplete="off">
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
              <div className="wba-input-group">
                <label htmlFor="account-secret" className="wba-input-label">{editingId ? 'New password (optional)' : 'Temporary password'}</label>
                <div className="wba-account-password">
                <input
                  id="account-secret"
                  name="account-secret"
                  className="wba-input-field"
                  type={showPassword ? 'text' : 'password'}
                  minLength={12}
                  maxLength={128}
                  required={!editingId}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="off"
                  spellCheck={false}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  aria-describedby="account-secret-help"
                />
                <button type="button" aria-controls="account-secret" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                <small id="account-secret-help" className="wba-field-help">At least 12 characters.{editingId && ' Leave blank to keep the current password.'}</small>
              </div>
              {error && <p className="wba-modal-error" role="alert">{error}</p>}
              <div className="wba-accounts-form-actions">
                <button type="button" className="wba-pill-btn" disabled={isSaving} onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="wba-btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Create account'}
                </button>
              </div>
            </form>
        </WorkspaceDialog>
      )}

      {/* Admin Deactivation Confirmation Modal */}
      {accountToDeactivate && (
        <WorkspaceDialog onClose={() => setAccountToDeactivate(null)} labelledBy="admin-deactivate-title" busy={isDeactivatingAccount} className="wba-confirm-dialog">
            <h2 id="admin-deactivate-title">Deactivate account?</h2>
            <div className="wba-dialog-identity"><strong>{accountToDeactivate.name}</strong><span>{accountToDeactivate.email}</span></div>
            <div className="wba-recovery-notice"><strong>30-day recovery</strong><p>Access stops immediately. Recover this account before {accountToDeactivate.recoveryDeadline}. After that date, it becomes eligible for permanent deletion.</p></div>
            <div className="wba-accounts-form-actions">
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
                className="wba-btn-primary wba-danger-button"
                onClick={executeDeactivation}
                disabled={isDeactivatingAccount}
              >
                {isDeactivatingAccount ? 'Deactivating…' : 'Deactivate account'}
              </button>
            </div>
        </WorkspaceDialog>
      )}
    </div>
  );
}
