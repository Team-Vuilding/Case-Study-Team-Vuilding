function deliveryError(reference, status = 502) {
  const message = status === 429
    ? 'Too many requests. Please try again later.'
    : `Could not confirm delivery. Keep reference ${reference} and wait before trying again.`;
  return Object.assign(new Error(message), { status, reference });
}

export async function sendSupportRequest(details, {
  accessKey = import.meta.env?.VITE_WEB3FORMS_ACCESS_KEY,
  fetchRequest = globalThis.fetch,
} = {}) {
  if (typeof accessKey !== 'string' || !accessKey.trim()) {
    throw Object.assign(new Error('Support is temporarily unavailable. Please try again later.'), { status: 503 });
  }

  const fields = ['name', 'email', 'category', 'subject', 'message'];
  const values = Object.fromEntries(fields.map(field => [field, typeof details[field] === 'string' ? details[field].trim() : '']));
  const errors = {};
  for (const [field, max] of Object.entries({ name: 100, email: 254, subject: 120, message: 5000 })) {
    if (!values[field] || values[field].length > max) errors[field] = [`Enter ${field === 'email' ? 'an email address' : `a ${field}`} within ${max} characters.`];
  }
  for (const field of ['name', 'subject']) {
    if (/[\r\n]/.test(details[field] || '')) errors[field] = ['Use a single line.'];
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = ['Enter a valid email address.'];
  if (!['Technical', 'Billing', 'Account', 'Feedback'].includes(values.category)) errors.category = ['Select a category.'];
  if (values.message.length < 10) errors.message = ['Enter at least 10 characters.'];
  if (details.consent !== true) errors.consent = ['Please agree before sending.'];
  if (Object.keys(errors).length) {
    throw Object.assign(new Error('Check the highlighted fields.'), { status: 422, data: { errors } });
  }

  const reference = `WBA-${crypto.randomUUID().toUpperCase()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let response;
  let result;
  try {
    response = await fetchRequest('https://api.web3forms.com/submit', {
      method: 'POST', credentials: 'omit', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey.trim(), from_name: 'WBA Support', name: values.name, email: values.email,
        subject: `[WBA Support] ${reference}: ${values.subject}`,
        category: values.category, message: values.message, reference,
      }),
    });
    result = await response.json();
  } catch {
    throw deliveryError(reference);
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 429) throw deliveryError(reference, 429);
  if (!response.ok || result?.success !== true) throw deliveryError(reference);
  return { data: { reference, status: 'sent' } };
}
