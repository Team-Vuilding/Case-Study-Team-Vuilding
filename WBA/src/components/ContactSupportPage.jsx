import { useRef, useState } from 'react';
import PublicPageLayout from './PublicPageLayout';
import { SUPPORT_EMAIL, createSupportEmail } from '../data/supportContact';
export default function ContactSupportPage(props) {
  const [notice, setNotice] = useState('');
  const noticeRef = useRef(null);
  const submit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    for (const field of ['name', 'email', 'subject', 'message']) {
      const input = form.elements.namedItem(field);
      input.setCustomValidity(values[field].trim() ? '' : 'Please enter a value.');
      if (!input.reportValidity()) return;
    }
    window.location.href = createSupportEmail(values);
    setNotice('Email draft requested. Send it from your email app to contact support. If no app opens, use the direct email address beside this form. Your message is still here.');
    requestAnimationFrame(() => noticeRef.current?.focus());
  };
  return <PublicPageLayout {...props} title="Contact Support" description="Tell us what you need help with, and include the details that will help us investigate.">
    <div className="wba-public-contact-grid">
      <section className="wba-public-panel" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title">How can we help?</h2><p>All fields are required. This form prepares an email draft for you to send.</p>
        <form className="wba-public-form" onSubmit={submit} onInput={event => { event.target.setCustomValidity?.(''); setNotice(''); }}>
          <div className="wba-public-form-row">
            <label htmlFor="contact-name">Name<input id="contact-name" name="name" autoComplete="name" defaultValue={props.currentUser?.name || ''} required maxLength={100} /></label>
            <label htmlFor="contact-email">Email<input id="contact-email" name="email" type="email" autoComplete="email" defaultValue={props.currentUser?.email || ''} required maxLength={254} /></label>
          </div>
          <label htmlFor="contact-category">Category<select id="contact-category" name="category" required defaultValue="Technical">{['Technical', 'Billing', 'Account', 'Feedback'].map(category => <option key={category}>{category}</option>)}</select></label>
          <label htmlFor="contact-subject">Subject<input id="contact-subject" name="subject" required maxLength={120} /></label>
          <label htmlFor="contact-message">Message<textarea id="contact-message" name="message" rows={7} required maxLength={5000} aria-describedby="contact-privacy" /></label>
          <p id="contact-privacy" className="wba-public-form-note">Include the affected page, error message, and steps to reproduce the issue. Leave out passwords, tokens, and confidential customer data. See our <a href="#/privacy">Privacy Policy</a>.</p>
          <button type="submit" className="wba-btn-primary">Open email draft</button>
          {notice && <p ref={noticeRef} tabIndex={-1} role="status" className="wba-public-notice">{notice}</p>}
        </form>
      </section>
      <aside className="wba-public-panel wba-public-contact-details" aria-label="Other ways to get help">
        <h2>Direct support</h2><p>Email the support inbox with your question.</p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        <h2>Chat support</h2><p>Live chat is not currently available. Use email for assistance, or send a support ticket from your signed-in workspace.</p>
        {props.currentUser && <a href="#/help-center">Open workspace support tickets</a>}
        <h2>Find an answer</h2><p>Browse guides on inventory, accounts, stock counts, and billing.</p><a href="#/help">Visit the Help Center</a>
      </aside>
    </div>
  </PublicPageLayout>;
}
