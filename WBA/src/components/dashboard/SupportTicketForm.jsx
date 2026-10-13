import { useRef, useState } from 'react';
import { apiRequest } from '../../services/api';

const SUPPORT_EMAIL = 'vincentjamesguhiling@gmail.com';
const EMPTY_TICKET = { category: 'technical', subject: '', description: '', page: 'help-center', steps: '', consent: false };
const CATEGORIES = [['access', 'Account & access'], ['inventory', 'Inventory & products'], ['warehouse', 'Warehouse operations'], ['purchasing', 'Purchasing'], ['technical', 'Technical problem'], ['other', 'Other']];
const PAGES = [['sign-in', 'Sign-in'], ['dashboard', 'Dashboard'], ['inventory', 'Inventory'], ['purchase-history', 'Purchase history'], ['audit-logs', 'Audit logs'], ['manage-accounts', 'Manage Accounts'], ['help-center', 'Help Center'], ['other', 'Other']];

export default function SupportTicketForm({ currentUser }) {
  const [form, setForm] = useState(EMPTY_TICKET);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [reference, setReference] = useState('');
  const inFlight = useRef(false);
  const notice = useRef(null);
  const update = event => {
    const { name, value, checked, type } = event.target;
    setForm(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    setFieldErrors(previous => ({ ...previous, [name]: undefined }));
  };
  const submit = async event => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setSending(true); setError(''); setFieldErrors({}); setReference('');
    try {
      const result = await apiRequest('support/tickets', { method: 'POST', body: {
        ...form, subject: form.subject.trim(), description: form.description.trim(), steps: form.steps.trim() || null,
      } });
      setReference(result.data.reference);
      setForm(EMPTY_TICKET);
    } catch (reason) {
      setError(reason.status === 429 ? 'You have reached the ticket limit. Wait one hour before trying again, or contact support directly.'
        : reason.status ? reason.message : 'Could not reach support. Your form has been kept. Check your connection or contact support directly.');
      setFieldErrors(reason.data?.errors || {});
    } finally {
      inFlight.current = false;
      setSending(false);
      requestAnimationFrame(() => notice.current?.focus());
    }
  };
  const errorFor = name => fieldErrors[name]?.[0];
  const accessibility = name => ({ 'aria-invalid': Boolean(errorFor(name)), 'aria-describedby': errorFor(name) ? `ticket-${name}-error` : undefined });
  const fieldError = name => errorFor(name) && <span id={`ticket-${name}-error`} className="wba-help-error">{errorFor(name)}</span>;

  return <section className="wba-glow-card wba-help-ticket" id="support-ticket" aria-labelledby="ticket-title">
    <div className="wba-help-section-heading"><h2 id="ticket-title" tabIndex={-1}>Send a support ticket</h2><p>Describe the problem so we can help you resolve it.</p></div>
    <p className="wba-help-contact">Support inbox: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><br />Replies go to your account email: <strong>{currentUser.email}</strong>.</p>
    {(error || reference) && <div ref={notice} tabIndex={-1} className={`wba-help-notice ${error ? 'wba-help-error' : ''}`} role={error ? 'alert' : 'status'}>
      {error || <><strong>Ticket sent · {reference}</strong><p>Gmail accepted your message. Keep this reference for follow-up and check your email for a reply.</p></>}
    </div>}
    <form onSubmit={submit} aria-busy={sending}>
      <fieldset disabled={sending}>
        <legend className="wba-help-sr-only">Support ticket details</legend>
        <div className="wba-help-form-row">
          <label className="wba-input-group" htmlFor="ticket-category"><span className="wba-input-label">Issue category</span><select id="ticket-category" name="category" className="wba-input-field" value={form.category} onChange={update} required {...accessibility('category')}>{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{fieldError('category')}</label>
          <label className="wba-input-group" htmlFor="ticket-page"><span className="wba-input-label">Affected page</span><select id="ticket-page" name="page" className="wba-input-field" value={form.page} onChange={update} required {...accessibility('page')}>{PAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{fieldError('page')}</label>
        </div>
        <label className="wba-input-group" htmlFor="ticket-subject"><span className="wba-input-label">Subject</span><input id="ticket-subject" name="subject" className="wba-input-field" placeholder="Briefly describe the problem" value={form.subject} onChange={update} required maxLength={120} {...accessibility('subject')} />{fieldError('subject')}</label>
        <label className="wba-input-group" htmlFor="ticket-description"><span className="wba-input-label">What happened?</span><textarea id="ticket-description" name="description" className="wba-input-field" rows={5} placeholder="Include the error message, when it happened, and what you expected." value={form.description} onChange={update} required minLength={10} maxLength={5000} {...accessibility('description')} />{fieldError('description')}</label>
        <label className="wba-input-group" htmlFor="ticket-steps"><span className="wba-input-label">Steps to reproduce <span className="wba-help-optional">(optional)</span></span><textarea id="ticket-steps" name="steps" className="wba-input-field" rows={3} placeholder="1. Open Inventory… 2. Select…" value={form.steps} onChange={update} maxLength={2000} {...accessibility('steps')} />{fieldError('steps')}</label>
        <p id="ticket-privacy" className="wba-help-privacy">Your account name, email, role, and ticket details will be emailed to support and retained in the support mailbox. Do not include passwords, tokens, or confidential customer data. Support replies by email; this page does not track ticket status.</p>
        <label className="wba-help-consent"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required aria-describedby="ticket-privacy" aria-invalid={Boolean(errorFor('consent'))} />I agree to share these details with support.</label>{fieldError('consent')}
        <button type="submit" className="wba-btn-primary" disabled={sending}>{sending ? 'Sending ticket…' : 'Send ticket'}</button>
      </fieldset>
    </form>
  </section>;
}
