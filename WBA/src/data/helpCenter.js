export const ROLE_NAMES = { admin: 'Admin', warehouse: 'Warehouse Staff', purchasing: 'Purchasing Manager', sales: 'Sales Staff' };
const ALL_ROLES = Object.keys(ROLE_NAMES);

export const HELP_TOPICS = [
  { id: 'getting-started', title: 'Getting Started', description: 'Sign in and find your way around WBA.' },
  { id: 'accounts', title: 'Accounts & Permissions', description: 'Understand your role and account access.' },
  { id: 'inventory', title: 'Inventory & Products', description: 'Read stock levels and manage the catalog.' },
  { id: 'warehouse', title: 'Warehouse Operations', description: 'Receive, dispatch, and reconcile stock.' },
  { id: 'purchasing', title: 'Purchasing', description: 'Work with suppliers and purchase orders.' },
  { id: 'troubleshooting', title: 'Troubleshooting & Support', description: 'Resolve common problems or send a ticket.' },
];

export const HELP_ARTICLES = [
  {
    id: 'sign-in', topic: 'getting-started', title: 'Sign in to your workspace', roles: ALL_ROLES,
    summary: 'Use the account and role assigned by your administrator.',
    steps: ['Open the sign-in form and select your assigned role.', 'Enter your account email and password, then sign in.', 'Use Dashboard for summaries and Inventory for product information. The sidebar shows the pages available to your role.'],
    note: 'If your role or password is unknown, ask your administrator. WBA does not currently offer self-service password reset.',
  },
  {
    id: 'dashboard', topic: 'getting-started', title: 'Read the dashboard', roles: ALL_ROLES,
    summary: 'Understand current stock summaries and recorded monthly activity.',
    steps: ['Review the summary cards. Sales sees available stock and reservations; other roles see storage cost, count mismatches, and expiry risk.', 'Read Monthly stock activity for recorded receipts and dispatches. Expand View monthly quantities to read the table.', 'Open the notification bell for inventory alerts.'],
    note: 'Monthly stock activity shows recorded history, not a demand prediction. Empty charts mean no movements have been recorded.',
  },
  {
    id: 'roles', topic: 'accounts', title: 'What each role can do', roles: ALL_ROLES,
    summary: 'Permissions are enforced by the server as well as the interface.',
    steps: ['Admin manages accounts and the catalog, oversees counts, and approves purchase orders.', 'Warehouse Staff receives and dispatches stock, uses QR scanning, and reconciles count mismatches.', 'Purchasing Manager manages supplier orders and can create or cancel purchase orders.', 'Sales Staff reads pricing, categories, and stock availability. Sales cannot change inventory or purchasing records.'],
    note: 'All four roles can use the Help Center and send support tickets. A guide does not grant permission to perform its actions.',
  },
  {
    id: 'manage-users', topic: 'accounts', title: 'Create accounts and reset passwords', roles: ['admin'],
    summary: 'Manage Accounts is available to Admin only.',
    steps: ['Open Manage Accounts and the account creation form.', 'Enter the person’s name, email, assigned role, and a password with at least 12 characters.', 'To reset a password, edit the account and enter a replacement password. Leave it blank to keep the existing password.'],
    note: 'An administrator cannot change their own role through this form. Share credentials through an approved private channel.',
  },
  {
    id: 'account-access', topic: 'accounts', title: 'Recover access to a deactivated account', roles: ALL_ROLES,
    summary: 'Deactivated accounts have a limited recovery period.',
    steps: ['Use the account reactivation option on the sign-in page with your existing credentials.', 'If recovery is unavailable or the account has expired, contact an administrator.', 'Ask the administrator to check your account status and role before creating a replacement account.'],
    note: 'Accounts scheduled for deletion cannot be recovered after their recovery deadline.',
  },
  {
    id: 'availability', topic: 'inventory', title: 'Understand stock availability and pricing', roles: ALL_ROLES,
    summary: 'On-hand stock and available-to-sell stock can differ.',
    steps: ['Open Inventory and find the product name and SKU in the ledger.', 'Read the on-hand quantity, reserved units, and picking allocations.', 'Available to sell is on-hand stock minus reserved and allocated units, with a minimum of zero. Check the listed unit price before quoting a customer.'],
    note: 'A count mismatch means the physical and recorded quantities differ. Ask Warehouse Staff or Admin to verify it.',
  },
  {
    id: 'add-product', topic: 'inventory', title: 'Add a product and classify it', roles: ['admin'],
    summary: 'Create a catalog item with a unique SKU and accurate initial stock.',
    steps: ['Open Inventory and select + Add Product.', 'Enter the name, SKU, bin location, unit price, initial stock, and storage cost.', 'Choose the A/B/C classification and stock-movement category. Enable batch tracking for products with a shelf life and enter the actual initial batch expiry when required.', 'Select Add to catalog and confirm the product appears in Active products.'],
    note: 'Catalog and pricing changes are Admin responsibilities. Do not use initial stock as a substitute for later receiving or dispatch records.',
  },
  {
    id: 'archive', topic: 'inventory', title: 'Archive, restore, or remove a product', roles: ['admin'],
    summary: 'Archiving hides a product from the active catalog while preserving its history.',
    steps: ['In Active products, select Archive beside an eligible product and enter a reason.', 'If Archive is disabled, read the blocking explanation. Stock, reserved or allocated units, count mismatches, batch stock, and open orders must be resolved first.', 'Open Archived products to restore an item, entering a reason for the change.', 'Permanent deletion is offered only for eligible unused products. Check the confirmation carefully; deleted products cannot be restored.'],
    note: 'Archived SKUs stay reserved. Purchase, stock, count, and audit history is preserved when an item is archived.',
  },
  {
    id: 'movement', topic: 'warehouse', title: 'Receive or dispatch stock using a SKU', roles: ['warehouse'],
    summary: 'The scanner also supports manual SKU entry.',
    steps: ['Open Inventory and select Scan to receive.', 'Scan the product QR label or type its SKU. Confirm the matched product.', 'Choose Receive stock or Dispatch stock and enter the actual quantity. For perishable receipts, enter the expiry date and lot when applicable.', 'Submit the operation and check the updated ledger.'],
    note: 'Dispatch is limited by available stock. If a save fails, check the ledger before repeating the operation.',
  },
  {
    id: 'qr-label', topic: 'warehouse', title: 'Generate a product QR label', roles: ['admin', 'warehouse'],
    summary: 'QR labels identify an existing product by SKU.',
    steps: ['Open Inventory and select Generate QR.', 'Choose the catalog product and check its name and SKU.', 'Use the available download or print action to create the label. Warehouse Staff can scan it when recording a movement.'],
    note: 'Generating a label does not change stock. Only Warehouse Staff can use the stock scanner.',
  },
  {
    id: 'reconcile', topic: 'warehouse', title: 'Resolve a stock count mismatch', roles: ['admin', 'warehouse'],
    summary: 'Verify physical stock before reconciling the ledger.',
    steps: ['Locate the product and its Count Mismatch in Inventory.', 'Verify the physical stock and investigate missing receipts, dispatches, or damaged goods.', 'Use Fix Count only after confirming the displayed physical quantity is correct. The action aligns the recorded count with that quantity.', 'Check that the mismatch is resolved. Report an unexplained discrepancy through a support ticket.'],
    note: 'Fix Count records reconciliation history. It does not replace an unrecorded receiving or dispatch transaction.',
  },
  {
    id: 'expiry', topic: 'warehouse', title: 'Read the FIFO / FEFO expiry queue', roles: ['admin', 'warehouse', 'purchasing'],
    summary: 'Review remaining batch stock and expiry risk.',
    steps: ['Open Inventory and review the batch expiry queue.', 'Check each batch’s location, quantity, and expiry date.', 'Follow warehouse policy for picking and handling expiring or expired stock.'],
    note: 'Reviewing a batch does not change its quantity. Record stock operations through the authorized workflow.',
  },
  {
    id: 'create-order', topic: 'purchasing', title: 'Add a supplier and create a purchase order', roles: ['admin', 'purchasing'],
    summary: 'Purchase orders start pending approval.',
    steps: ['Open Purchase history and select + New order.', 'Choose a supplier or enter a supplier name and select Save supplier.', 'Select the product, quantity, unit cost, expected delivery date, and any notes.', 'Select Submit for approval and check the order in the list.'],
    note: 'Creating an order does not add stock. Admin approval and recorded delivery are separate steps.',
  },
  {
    id: 'receive-order', topic: 'purchasing', title: 'Approve, receive, or cancel an order', roles: ['admin', 'warehouse', 'purchasing'],
    summary: 'Available order actions depend on your role and the order status.',
    steps: ['Admin can approve orders that are pending approval.', 'Admin or Warehouse Staff can select Receive delivery for approved orders. Verify all ordered units have arrived and supply actual expiry dates where required.', 'Admin or Purchasing Manager can cancel pending or approved orders.', 'Use the search and status filter to check the resulting order status.'],
    note: 'Confirm receipt only when the full delivery has arrived. Do not also receive the same units through the scanner.',
  },
  {
    id: 'forecast', topic: 'purchasing', title: 'Use stock activity when planning purchases', roles: ['admin', 'purchasing'],
    summary: 'Compare recorded movements, availability, alerts, and open orders.',
    steps: ['Review monthly receipts and dispatches on Dashboard.', 'Check current stock and low-stock alerts, then review pending and approved purchase orders.', 'Use this information with your company’s reorder policy before creating another order.'],
    note: 'Dedicated demand-forecast reports and configurable reorder-point screens are not currently available in this interface.',
  },
  {
    id: 'access-error', topic: 'troubleshooting', title: 'Sign-in failures or access denied', roles: ALL_ROLES,
    summary: 'Check account access before repeating an action.',
    steps: ['Confirm that you selected the assigned role and entered the correct account email.', 'If your session expired, sign in again. Sessions expire after 12 hours.', 'Ask an administrator to verify your account status or permissions. If the problem persists, send a ticket with the page and error message.'],
    note: 'Never include your password, session token, or recovery credentials in a ticket.',
  },
  {
    id: 'connection-error', topic: 'troubleshooting', title: 'Unavailable service or failed save', roles: ALL_ROLES,
    summary: 'Keep your work and check whether the action completed.',
    steps: ['Check your internet connection and wait briefly before using Retry. A sleeping hosted service may take time to wake.', 'For a failed save, check the relevant ledger or order list before submitting again to avoid recording the same action twice.', 'If the problem persists, note the error, time, page, and steps, then send a support ticket.'],
    note: 'If the backend is unavailable, ticket sending may also be unavailable. Keep your description and use the support email shown in the form.',
  },
  {
    id: 'camera-error', topic: 'troubleshooting', title: 'Camera or QR scanning problems', roles: ['warehouse'],
    summary: 'Manual SKU entry is available when scanning does not work.',
    steps: ['Allow camera access in your browser and use HTTPS or localhost.', 'Select Restart camera and make sure another application is not using it.', 'If your browser cannot decode QR codes, type the SKU manually and confirm the matched product before saving.'],
    note: 'An unknown SKU must be added to the catalog by an administrator before stock can be recorded.',
  },
];

export function findHelpArticles({ role, topic = 'all', query = '', relevantOnly = true }) {
  const search = query.trim().toLowerCase();
  return HELP_ARTICLES.filter(article =>
    (!relevantOnly || article.roles.includes(role)) &&
    (topic === 'all' || article.topic === topic) &&
    [article.title, article.summary, article.note, ...article.steps].join(' ').toLowerCase().includes(search));
}
