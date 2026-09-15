/**
 * WBA Dummy Account Credentials (Role-Based Auth System)
 * Based on WalangBrownout Appliances organizational structure
 */
export const DUMMY_ACCOUNTS = [
  {
    id: 'USR-001',
    name: 'Vincent Guhiling',
    email: 'admin@wba.com',
    password: 'wba@admin2026',
    role: 'Admin',
    initials: 'VG',
    department: 'Operations Management',
    accessLevel: 'full',
    avatar: null,
  },
  {
    id: 'USR-002',
    name: 'Jane Dela Cruz',
    email: 'inventory@wba.com',
    password: 'wba@inventory2026',
    role: 'Inventory Manager',
    initials: 'JD',
    department: 'Warehouse & Logistics',
    accessLevel: 'inventory',
    avatar: null,
  },
  {
    id: 'USR-003',
    name: 'Carlos Reyes',
    email: 'purchasing@wba.com',
    password: 'wba@purchasing2026',
    role: 'Purchasing Manager',
    initials: 'CR',
    department: 'Procurement & Supply Chain',
    accessLevel: 'purchasing',
    avatar: null,
  },
  {
    id: 'USR-004',
    name: 'Mark Ramos',
    email: 'auditor@wba.com',
    password: 'wba@auditor2026',
    role: 'Auditor',
    initials: 'MR',
    department: 'Finance & Compliance',
    accessLevel: 'audit',
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
