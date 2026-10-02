/**
 * WBA Dummy Account Credentials (Role-Based Auth System)
 * Based on WalangBrownout Appliances organizational structure
 */
export const DUMMY_ACCOUNTS = [
  {
    id: 'USR-001',
    name: 'Charles Villacrudz',
    email: 'admin@wba.com',
    password: 'wba@admin2026',
    role: 'Admin',
    initials: 'CV',
    department: 'System & User Management',
    accessLevel: 'admin',
    avatar: null,
  },
  {
    id: 'USR-002',
    name: 'Mark Christian',
    email: 'warehouse@wba.com',
    password: 'wba@warehouse2026',
    role: 'Warehouse Staff',
    initials: 'MC',
    department: 'Warehouse Operations',
    accessLevel: 'warehouse',
    avatar: null,
  },
  {
    id: 'USR-003',
    name: 'Billy Vicenciords',
    email: 'purchasing@wba.com',
    password: 'wba@purchasing2026',
    role: 'Purchasing Manager',
    initials: 'BV',
    department: 'Procurement & Supply Chain',
    accessLevel: 'purchasing',
    avatar: null,
  },
  {
    id: 'USR-004',
    name: 'Vincent Angela',
    email: 'sales@wba.com',
    password: 'wba@sales2026',
    role: 'Sales Staff',
    initials: 'VA',
    department: 'Sales & Customer Service',
    accessLevel: 'sales',
    avatar: null,
  },
];

/**
 * Authenticate user with email + password.
 * Returns the user object or null if invalid.
 */
const ACCOUNT_STORAGE_KEY = 'wba_accounts_v1';
const ACTIVITY_STORAGE_KEY = 'wba_account_activity_v1';

const publicAccount = account => Object.fromEntries(
  Object.entries(account).filter(([key]) => !['password', 'passwordHash', 'passwordSalt'].includes(key))
);

export function getAccounts() {
  const initialAccounts = DUMMY_ACCOUNTS.map(account => ({ ...publicAccount(account), status: 'active' }));
  try {
    const stored = JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY));
    return Array.isArray(stored) ? stored : initialAccounts;
  } catch {
    return initialAccounts;
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
}

export function getAccountActivity() {
  try {
    const stored = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function recordAccountActivity(actor, action, target) {
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor,
    action,
    target,
  };
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify([entry, ...getAccountActivity()].slice(0, 100)));
  return entry;
}

export async function hashAccountPassword(password, salt = crypto.randomUUID()) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return { passwordSalt: salt, passwordHash: Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') };
}

export async function authenticate(email, password, expectedAccessLevel = null) {
  const account = getAccounts().find(user => user.email.toLowerCase() === email.toLowerCase().trim());
  if (!account || account.status !== 'active' || (expectedAccessLevel && account.accessLevel !== expectedAccessLevel)) return null;
  const demo = DUMMY_ACCOUNTS.find(user => user.id === account.id);
  const valid = account.passwordHash
    ? (await hashAccountPassword(password, account.passwordSalt)).passwordHash === account.passwordHash
    : demo?.password === password;
  if (!valid) return null;
  recordAccountActivity(account.name, 'Signed in', account.email);
  return publicAccount(account);
}

export function getActiveAccount(id) {
  const account = getAccounts().find(user => user.id === id && user.status === 'active');
  return account ? publicAccount(account) : null;
}
