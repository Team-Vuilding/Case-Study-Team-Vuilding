export const SUPPORT_EMAIL = 'vincentjamesguhiling@gmail.com';
export function createSupportEmail({ name, email, category, subject, message }) {
  const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\nCategory: ${category}\n\n${message.trim()}`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${category}] ${subject.trim()}`)}&body=${encodeURIComponent(body)}`;
}
