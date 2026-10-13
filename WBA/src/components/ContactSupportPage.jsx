import { useRef, useState } from 'react';
import PublicPageLayout from './PublicPageLayout';
import { sendSupportRequest } from '../services/support';

export default function ContactSupportPage(props) {
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const noticeRef = useRef(null);
  const inFlight = useRef(false);
  const submit = async event => {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    for (const field of ['name', 'email', 'subject', 'message']) {
      const input = form.elements.namedItem(field);
      values[field] = values[field].trim();
      input.setCustomValidity(values[field] ? '' : 'Please enter a value.');
      if (!input.reportValidity()) return;
    }
    inFlight.current = true;
    setSending(true); setError(''); setNotice(''); setFieldErrors({});
    try {
      const result = await sendSupportRequest({ ...values, consent: values.consent === 'on' });
      if (!result.data?.reference || result.data.status !== 'sent') throw new Error('Support did not confirm your request. Your form has been kept. Please try again later.');
      setNotice(`Request sent. Reference: ${result.data.reference}.`);
      form.reset();
    } catch (reason) {
      setError(reason.message || 'Could not reach support. Please try again later.');
      setFieldErrors(reason.data?.errors || {});
    } finally {
      inFlight.current = false;
      setSending(false);
      requestAnimationFrame(() => noticeRef.current?.focus());
    }
  };
  const accessibility = name => ({ 'aria-invalid': Boolean(fieldErrors[name]), 'aria-describedby': fieldErrors[name] ? `contact-${name}-error` : name === 'message' ? 'contact-privacy' : undefined });
  const fieldError = name => fieldErrors[name] && <span className="wba-public-field-error" id={`contact-${name}-error`}>{fieldErrors[name][0]}</span>;
  return <PublicPageLayout {...props} title="Contact Support" description="Submit a complaint or ask a question. This is the place to contact the WBA support team.">
    <div className="wba-public-contact-grid">
      <section className="wba-public-panel" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title">How can we help?</h2><p>All fields are required. You can send a request without signing in.</p>
        {(notice || error) && <p ref={noticeRef} tabIndex={-1} role={error ? 'alert' : 'status'} className="wba-public-notice">{error || notice}</p>}
        <form className="wba-public-form" onSubmit={submit} aria-busy={sending} onInput={event => { event.target.setCustomValidity?.(''); setFieldErrors(previous => ({ ...previous, [event.target.name]: undefined })); }}>
          <fieldset disabled={sending}>
            <legend className="wba-help-sr-only">Support request details</legend>
            <div className="wba-public-form-row">
              <label htmlFor="contact-name">Name<input id="contact-name" name="name" autoComplete="name" defaultValue={props.currentUser?.name || ''} required maxLength={100} {...accessibility('name')} />{fieldError('name')}</label>
              <label htmlFor="contact-email">Email<input id="contact-email" name="email" type="email" autoComplete="email" defaultValue={props.currentUser?.email || ''} required maxLength={254} {...accessibility('email')} />{fieldError('email')}</label>
            </div>
            <label htmlFor="contact-category">Category<select id="contact-category" name="category" required defaultValue="Technical" {...accessibility('category')}>{['Technical', 'Billing', 'Account', 'Feedback'].map(category => <option key={category}>{category}</option>)}</select>{fieldError('category')}</label>
            <label htmlFor="contact-subject">Subject<input id="contact-subject" name="subject" required maxLength={120} {...accessibility('subject')} />{fieldError('subject')}</label>
            <label htmlFor="contact-message">Message<textarea id="contact-message" name="message" rows={7} required minLength={10} maxLength={5000} {...accessibility('message')} />{fieldError('message')}</label>
            <p id="contact-privacy" className="wba-public-form-note">Leave out passwords and confidential data. Web3Forms processes your details to deliver this request to support. <a href="#/privacy">Privacy Policy</a>.</p>
            <label className="wba-public-consent" htmlFor="contact-consent"><input id="contact-consent" name="consent" type="checkbox" required {...accessibility('consent')} />I agree to share these details with support.</label>{fieldError('consent')}
            <button type="submit" className="wba-btn-primary" disabled={sending}>{sending ? 'Sending request...' : 'Send request'}</button>
          </fieldset>
        </form>
      </section>
      <aside className="wba-public-panel wba-public-contact-details" aria-label="Support guidance">
        <h2>What to include</h2><p>Tell us what happened, what you expected, and when the issue occurred. Include a product SKU or request reference where relevant.</p>
        <h2>After you submit</h2><p>A successful submission shows a reference number. Keep it for follow-up and check the email address you provided for a reply.</p>
        <h2>Find an answer</h2><p>Browse guides on inventory, accounts, stock counts, and billing.</p><a href="#/help">Visit the Help Center</a>
      </aside>
    </div>
  </PublicPageLayout>;
}
