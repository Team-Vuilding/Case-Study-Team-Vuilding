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
export function authenticate(email, password) {
  return DUMMY_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === email.toLowerCase().trim() &&
      acc.password === password
  ) || null;
}
