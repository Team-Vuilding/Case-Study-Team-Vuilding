import React, { useState } from 'react';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { hasPermission, PERMISSIONS } from '../../data/rbac';

const ROLES = [
  { value: 'admin', label: 'Admin', department: 'System & User Management', summary: 'Users, inventory catalog, oversight, purchasing approvals' },
  { value: 'warehouse', label: 'Warehouse Staff', department: 'Warehouse Operations', summary: 'Stock movement, physical counts, reconciliation' },
  { value: 'purchasing', label: 'Purchasing Manager', department: 'Procurement & Supply Chain', summary: 'Suppliers, purchase orders, reorder points, forecasts' },
  { value: 'sales', label: 'Sales Staff', department: 'Sales & Customer Service', summary: 'Read-only pricing, availability, and categories' },
];

const emptyForm = { name: '', email: '', accessLevel: 'warehouse', password: '' };
const initialsFor = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');

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

  if (!authorized) return <div className="wba-glow-card">Access denied.</div>;

  const refresh = refreshData;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = account => {
    setEditingId(account.id);
    setForm({ name: account.name, email: account.email, accessLevel: account.accessLevel, password: '' });
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async event => {
    event.preventDefault();
    if (!hasPermission(currentUser?.accessLevel, PERMISSIONS.MANAGE_ACCOUNTS)) return;
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const role = ROLES.find(item => item.value === form.accessLevel);
    if (!name || !email || !role) return setError('Complete the name, email, and role.');
    if (accounts.some(account => account.id !== editingId && account.email.toLowerCase() === email)) return setError('This email already belongs to another account.');
    if (!editingId && form.password.length < 12) return setError('New accounts need a password of at least 12 characters.');
    if (editingId && form.password && form.password.length < 12) return setError('A replacement password needs at least 12 characters.');
    if (editingId === currentUser.id && form.accessLevel !== currentUser.accessLevel) return setError('You cannot change your own role.');

    try {
      await apiRequest(editingId ? 'users/' + editingId : 'users', { method: editingId ? 'PUT' : 'POST', body: { name, email, accessLevel: role.value, ...(form.password ? { password: form.password } : {}) } });
      refresh();
      setIsFormOpen(false);
      setNotice(`${name} ${editingId ? 'updated' : 'added'} successfully.`);
    } catch (reason) {
      setError(reason.message);
    }
  };

  const toggleStatus = async account => {
    if (!hasPermission(currentUser?.accessLevel, PERMISSIONS.MANAGE_ACCOUNTS)) return;
    if (account.id === currentUser.id) return setNotice('You cannot deactivate your own account.');
    const status = account.status === 'active' ? 'inactive' : 'active';
    try {
      await apiRequest('users/' + account.id, { method: 'PUT', body: { name: account.name, email: account.email, accessLevel: account.accessLevel, status } });
      refresh();
      setNotice(`${account.name} is now ${status}.`);
    } catch (reason) {
      setNotice(reason.message);
    }
  };

  if (users.loading || users.error || events.loading || events.error) return <ApiStatus loading={users.loading || events.loading} error={users.error || events.error} onRetry={() => { users.reload(); events.reload(); }} />;

  const visibleAccounts = accounts.filter(account =>
    (roleFilter === 'all' || account.accessLevel === roleFilter) &&
    `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wba-grid-container wba-accounts-page">
      <div className="wba-section-page-header">
        <div>
          <h2 className="wba-section-page-title">Manage Accounts</h2>
          <p className="wba-section-page-desc">Create accounts, assign fixed roles, and review account activity.</p>
        </div>
        <button type="button" className="wba-btn-primary" onClick={openCreate}>+ Add user</button>
      </div>


      {notice && <p className="wba-accounts-notice" role="status">{notice}</p>}

      <section className="wba-accounts-summary" aria-label="Account summary">
        <div><span>Total users</span><strong>{accounts.length}</strong></div>
        <div><span>Active users</span><strong>{accounts.filter(account => account.status === 'active').length}</strong></div>
      </section>

      <section className="wba-glow-card wba-accounts-card">
        <div className="wba-accounts-section-head">
          <div><h3>User directory</h3><p>Search or filter the people who can sign in.</p></div>
          <div className="wba-accounts-filters">
            <input className="wba-input-field" type="search" aria-label="Search users" placeholder="Search name or email" value={search} onChange={event => setSearch(event.target.value)} />
            <select className="wba-input-field" aria-label="Filter by role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
              <option value="all">All roles</option>
              {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </div>
        </div>
        <div className="wba-accounts-list">
          {visibleAccounts.length === 0 && <p className="wba-accounts-empty">No accounts match your search.</p>}
          {visibleAccounts.map(account => (
            <div className="wba-account-row" key={account.id}>
              <span className="wba-account-avatar" aria-hidden="true">{account.initials || initialsFor(account.name)}</span>
              <div className="wba-account-identity"><strong>{account.name}</strong><span>{account.email}</span></div>
              <span className="wba-account-role">{account.role}</span>
              <span className={`wba-account-status ${account.status === 'active' ? 'active' : 'inactive'}`}>{account.status === 'active' ? 'Active' : 'Inactive'}</span>
              <div className="wba-account-actions">
                <button type="button" onClick={() => openEdit(account)}>Edit</button>
                <button type="button" onClick={() => toggleStatus(account)} disabled={account.id === currentUser.id} title={account.id === currentUser.id ? 'You cannot deactivate yourself' : undefined}>
                  {account.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wba-glow-card wba-accounts-card">
        <div className="wba-accounts-section-head"><div><h3>Account activity</h3><p>Recent sign-ins and account changes recorded by the server.</p></div></div>
        <div className="wba-account-activity">
          {activity.length === 0 && <p className="wba-accounts-empty">No account activity yet.</p>}
          {activity.slice(0, 8).map(entry => <div key={entry.id}><strong>{entry.action}</strong><span>{entry.target} · {entry.actor}</span><time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time></div>)}
        </div>
      </section>

      {isFormOpen && <div className="wba-dash-modal-overlay" onClick={() => setIsFormOpen(false)}>
        <div className="wba-dash-modal-card wba-account-modal" role="dialog" aria-modal="true" aria-labelledby="wba-account-form-title" onClick={event => event.stopPropagation()}>
          <button type="button" className="wba-modal-close-btn" aria-label="Close account form" onClick={() => setIsFormOpen(false)}>&times;</button>
          <h2 id="wba-account-form-title">{editingId ? 'Edit account' : 'Add user'}</h2>
          <p className="wba-accounts-form-intro">Choose a role to apply its approved page and action permissions.</p>
          <form onSubmit={handleSave} className="wba-account-form">
            <label className="wba-input-group"><span className="wba-input-label">Full name</span><input className="wba-input-field" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
            <label className="wba-input-group"><span className="wba-input-label">Work email</span><input className="wba-input-field" type="email" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label>
            <label className="wba-input-group"><span className="wba-input-label">Role</span><select className="wba-input-field" value={form.accessLevel} disabled={editingId === currentUser.id} onChange={event => setForm({ ...form, accessLevel: event.target.value })}>{ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
            <label className="wba-input-group"><span className="wba-input-label">{editingId ? 'New password (optional)' : 'Temporary password'}</span><input className="wba-input-field" type="password" minLength={12} required={!editingId} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} autoComplete="new-password" /></label>
            <p className="wba-accounts-role-help">{ROLES.find(role => role.value === form.accessLevel)?.summary}</p>
            {error && <p className="wba-modal-error" role="alert">{error}</p>}
            <div className="wba-accounts-form-actions"><button type="button" className="wba-pill-btn" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit" className="wba-btn-primary">{editingId ? 'Save changes' : 'Create account'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}
