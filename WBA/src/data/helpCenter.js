export const ROLE_NAMES = { admin: 'Admin', warehouse: 'Warehouse Staff', purchasing: 'Purchasing Manager', sales: 'Sales Staff' };

export const GENERAL_HELP_TOPICS = [
  { id: 'counts', title: 'Stock Count Mismatches', description: 'Physical counts and recorded quantities.' },
  { id: 'billing', title: 'Billing', description: 'Payment questions and service agreements.' },
  { id: 'overview', title: 'About WBA', description: 'What the system does and who uses it.' },
  { id: 'access', title: 'Account Settings', description: 'Sign-in, accounts, and recovery.' },
  { id: 'concepts', title: 'Inventory Management', description: 'Understand the terms used throughout WBA.' },
  { id: 'support', title: 'General troubleshooting', description: 'Connection help and contacting support.' },
];

export const GENERAL_HELP_ARTICLES = [
  {
    id: 'count-mismatch', topic: 'counts', title: 'Why does my physical stock count differ from WBA?',
    summary: 'Review recent movements and committed units before requesting a correction.',
    steps: ['Confirm the SKU, bin, batch, and unit of measure, then repeat the physical count.', 'Compare on-hand stock with the physical count. Available-to-sell stock excludes reserved and allocated units, so it can be lower.', 'Ask authorized Warehouse Staff to review recent receiving, dispatch, and count records and reconcile the mismatch using their workspace guide.'],
    note: 'Record the count time and discrepancy. Do not create duplicate stock movements to force a match.',
  },
  {
    id: 'billing-contact', topic: 'billing', title: 'How do I resolve a billing question or request an invoice?',
    summary: 'Your service agreement and organization billing owner determine payment arrangements.',
    steps: ['Ask your organization billing owner to check the applicable service agreement and invoice.', 'Contact support using the Billing category with your organization name and invoice reference, if available.', 'For pricing, renewal, cancellation, or refund questions, ask support to confirm the terms of your agreement.'],
    note: 'WBA has no self-service billing screen. Do not send payment card numbers or banking credentials in a support request.',
  },
  {
    id: 'overview', topic: 'overview', title: 'What is WBA?',
    summary: 'A shared workspace for inventory, warehouse operations, and purchasing.',
    steps: ['WBA brings product records, stock availability, receiving, dispatching, and purchase orders into one system.', 'Teams use the same recorded inventory while seeing the pages and actions assigned to their role.', 'This public Help Center explains the system. Detailed task guides are available inside your signed-in workspace.'],
    note: 'You can read general help without signing in.',
  },
  {
    id: 'role-overview', topic: 'overview', title: 'Who uses the system?',
    summary: 'Four roles work together with different responsibilities.',
    steps: ['Admin oversees accounts, the catalog, purchasing approvals, and global records.', 'Warehouse Staff handles stock operations and count reconciliation.', 'Purchasing Manager coordinates suppliers and purchase orders.', 'Sales Staff checks product pricing and availability.'],
    note: 'Your administrator assigns your role. Each workspace contains its own task guides.',
  },
  {
    id: 'sign-in', topic: 'access', title: 'How to sign in',
    summary: 'Use the email, password, and role assigned to your account.',
    steps: ['Return to the home page and select Log in.', 'Choose your assigned role, then enter your account email and password.', 'After signing in, open Help center at the bottom of the workspace sidebar for your role’s instructions. On mobile, open the sidebar menu first.'],
    note: 'WBA does not offer public self-registration. Ask your administrator for an account.',
  },
  {
    id: 'account-access', topic: 'access', title: 'Passwords, expired sessions, and account recovery',
    summary: 'Find the right next step when you cannot access your workspace.',
    steps: ['If you forgot your password or do not know your role, ask your administrator. There is no self-service password reset page.', 'Sign in again when your session expires. Sessions last up to 12 hours.', 'For a deactivated account, try signing in with your existing credentials and use Reactivate My Account if recovery is offered. Contact your administrator if it is unavailable.'],
    note: 'Deactivated accounts have a 30-day recovery window. Accounts past their recovery deadline cannot be restored.',
  },
  {
    id: 'terminology', topic: 'concepts', title: 'Stock quantities and product terms',
    summary: 'The key terms you will see in the inventory workspace.',
    steps: ['SKU is the unique product identifier. A bin is its recorded storage location.', 'On-hand stock is the physical quantity. Reserved units and allocated units are already committed or assigned for picking.', 'Available to sell is on-hand stock minus reserved and allocated units, with a minimum of zero.', 'A count mismatch is a difference between physical and recorded stock. A purchase order records goods requested from a supplier.'],
    note: 'Viewing a quantity does not change stock. Stock changes require an authorized workflow.',
  },
  {
    id: 'batch-terms', topic: 'concepts', title: 'Batches, expiry, and archived products',
    summary: 'Understand how the system identifies and preserves product records.',
    steps: ['A batch or lot groups stock received together, with a quantity and expiry date where applicable.', 'FIFO means first in, first out. FEFO means first expiry, first out. Follow your company’s handling policy.', 'An archived product is hidden from the active catalog while its recorded history and SKU are retained.'],
    note: 'Archiving, restoration, receiving, and picking instructions are covered in the appropriate role’s workspace guides.',
  },
  {
    id: 'connection-help', topic: 'support', title: 'The website is slow or cannot connect',
    summary: 'Check your connection and allow a sleeping hosted service time to wake.',
    steps: ['Check your internet connection and reload the page if needed.', 'Wait briefly before selecting Retry. An idle hosted backend may need time to wake.', 'If the issue continues, note the page, time, browser, and error message before contacting support.'],
    note: 'General help stays available without a backend connection. Workspace data and Contact Support submissions need the backend.',
  },
  {
    id: 'contact-support', topic: 'support', title: 'Contact support or report a problem',
    summary: 'Send useful details without sharing passwords or sensitive records.',
    steps: ['Use the Contact Support page to submit a complaint or ask a question. Include a short subject, the affected page, what happened, and steps to reproduce it.', 'Contact Support is available without signing in. Provide your name and a valid email address for replies.', 'For a failed save, check the relevant record before repeating the action so it is not recorded twice. Keep the request reference for follow-up.'],
    note: 'Do not send passwords, tokens, or confidential customer information. Support replies by email.',
  },
];

export const ROLE_HELP = {
  admin: {
    title: 'Admin task guides', description: 'Manage accounts and the catalog, oversee stock accuracy, and approve supplier orders.',
    topics: [
      { id: 'oversight', title: 'Dashboard & oversight', description: 'Review system summaries and global activity.' },
      { id: 'accounts', title: 'Account management', description: 'Create users and maintain their access.' },
      { id: 'catalog', title: 'Product catalog', description: 'Add, archive, restore, and remove products.' },
      { id: 'purchasing', title: 'Purchasing approvals', description: 'Approve and oversee supplier orders.' },
    ],
    articles: [
      { id: 'admin-dashboard', topic: 'oversight', title: 'Review inventory health as Admin', summary: 'Use system summaries to identify work that needs attention.', steps: ['Open Dashboard and review storage cost, stock count mismatches, and expiry risk.', 'Review recorded monthly receipts and dispatches, then open the notification bell for alerts.', 'Coordinate stock issues with Warehouse Staff and supplier-order issues with the Purchasing Manager.'], note: 'The monthly activity chart shows recorded history, not a demand prediction.' },
      { id: 'admin-audit', topic: 'oversight', title: 'Review global audit logs', summary: 'Trace recorded account and inventory changes.', steps: ['Open Audit logs from the sidebar.', 'Use the available filters to locate the event and review its actor, time, action, and target.', 'Investigate unexplained changes and include the relevant reference when submitting a request through Contact Support.'], note: 'Global Audit logs are Admin-only. Do not distribute account or operational records outside approved channels.' },
      { id: 'admin-count', topic: 'oversight', title: 'Verify and reconcile a count mismatch', summary: 'Oversee stock accuracy before aligning the ledger.', steps: ['Find the product’s Count Mismatch in Inventory.', 'Confirm the displayed physical quantity with Warehouse Staff and investigate missing movements.', 'Select Fix Count only after verifying that quantity, then check the mismatch is resolved.'], note: 'Fix Count records reconciliation history. It does not replace a missing receipt or dispatch.' },
      { id: 'admin-users', topic: 'accounts', title: 'Create an account or reset a password', summary: 'Assign the appropriate role through Manage Accounts.', steps: ['Open Manage Accounts and the account creation form.', 'Enter the person’s name, email, assigned role, and a password of at least 12 characters.', 'To reset a password, edit the account and enter a replacement password. Leave it blank to retain the current one.'], note: 'You cannot change your own role here. Share credentials only through an approved private channel.' },
      { id: 'admin-deactivate', topic: 'accounts', title: 'Deactivate or restore an account', summary: 'Manage access when someone leaves or needs recovery.', steps: ['Find the account in Manage Accounts and check that it is the correct person.', 'Use the deactivation action and review the confirmation and recovery deadline.', 'Use the available reactivation action before the recovery period expires when access should be restored.'], note: 'Deactivation removes access. Accounts have a limited recovery window; check the displayed deadline.' },
      { id: 'admin-add', topic: 'catalog', title: 'Add a catalog product', summary: 'Create an item with a unique SKU and accurate initial stock.', steps: ['Open Inventory and select + Add Product.', 'Enter its name, bin, unit price, initial stock, and cost.', 'Choose its movement rate. Enable Track batches and expiry for expiring products and enter the required expiry details.', 'Check the SKU preview, select Add to catalog, and check Active products.'], note: 'Later receipts and dispatches should use stock-operation workflows, not another initial-stock entry.' },
      { id: 'admin-archive', topic: 'catalog', title: 'Archive, restore, or remove a product', summary: 'Preserve history when removing a product from the active catalog.', steps: ['Select Archive for an eligible product in Active products and enter a reason.', 'Resolve the displayed blockers first: stock, reserved or allocated units, count mismatches, batch stock, or open orders.', 'Use Archived products to restore an item with a reason.', 'Use permanent deletion only for an eligible unused product and review the confirmation carefully.'], note: 'Archived SKUs remain reserved and history is preserved. Permanent deletion cannot be reversed.' },
      { id: 'admin-qr', topic: 'catalog', title: 'Create a product QR label', summary: 'Provide Warehouse Staff with a label for an existing SKU.', steps: ['Open Inventory and select Generate QR.', 'Select the product and verify the name and SKU.', 'Select Download QR (SVG) and use the label for the correct product.'], note: 'Generating a label does not change stock. The stock scanner is available to Warehouse Staff.' },
      { id: 'admin-order', topic: 'purchasing', title: 'Approve an order and oversee delivery', summary: 'Review supplier orders before authorizing receipt.', steps: ['Open Purchase history and filter for pending approval.', 'Check the supplier, product, ordered quantity, and cost, then select Approve when appropriate.', 'For an approved order, confirm all units arrived before using Receive delivery. Enter actual expiry dates when required.', 'Cancel a pending or approved order when it should no longer proceed.'], note: 'Do not receive the same delivery through both its order and the stock scanner. Use the Purchasing Manager’s supplier process when delegating procurement.' },
      { id: 'admin-create-order', topic: 'purchasing', title: 'Create a supplier order as Admin', summary: 'Enter a supplier purchase when handling procurement directly.', steps: ['Select + New order in Purchase history.', 'Choose an existing supplier or enter a name under Add a supplier and select Save supplier.', 'Choose the product, enter quantity, unit cost, expected delivery date, and notes, then select Submit for approval.', 'Review the resulting pending order before approving it.'], note: 'Order creation and approval do not increase stock. Record the actual delivery separately.' },
    ],
  },
  warehouse: {
    title: 'Warehouse Staff task guides', description: 'Receive and dispatch stock, verify quantities, and handle product batches.',
    topics: [
      { id: 'movements', title: 'Receiving & dispatch', description: 'Record stock operations and deliveries.' },
      { id: 'counts', title: 'Counts & reconciliation', description: 'Verify stock and resolve ledger mismatches.' },
      { id: 'batches', title: 'QR labels & batches', description: 'Identify products and review expiry risk.' },
    ],
    articles: [
      { id: 'warehouse-start', topic: 'movements', title: 'Prepare for your warehouse shift', summary: 'Check the inventory and delivery information relevant to your work.', steps: ['Review Dashboard for count mismatches and expiry risk, then check inventory alerts.', 'Open Inventory to identify products and their storage bins.', 'Open Purchase history to review approved orders awaiting delivery.'], note: 'Catalog, pricing, account management, and global audit-log changes are outside the Warehouse Staff role.' },
      { id: 'warehouse-receive', topic: 'movements', title: 'Receive stock using a SKU', summary: 'Record a physical receipt through the stock scanner.', steps: ['Open Inventory and select Scan Product.', 'Scan the QR label or enter the SKU manually and confirm the matched product.', 'Choose Receive stock, enter the actual quantity, and supply lot and expiry details for perishable stock.', 'Submit the receipt and verify the ledger quantity.'], note: 'If these units belong to an approved purchase order, use Receive delivery for that order instead to avoid recording the same units twice.' },
      { id: 'warehouse-dispatch', topic: 'movements', title: 'Dispatch stock using a SKU', summary: 'Record outgoing units against available stock.', steps: ['Open Inventory and select Scan Product to open the stock-operation form.', 'Scan or enter the product SKU, then change Operation to Dispatch stock.', 'Confirm the product and actual outgoing quantity, submit Dispatch stock, and check the ledger.'], note: 'Dispatch is limited by available stock after reservations and allocations. Check the ledger before repeating a failed submission.' },
      { id: 'warehouse-delivery', topic: 'movements', title: 'Receive an approved purchase-order delivery', summary: 'Record all ordered units when the supplier delivery is complete.', steps: ['Open Purchase history and locate the approved order.', 'Check the delivered products and quantities against the order.', 'Select Receive delivery, enter actual expiry dates where required, and confirm receipt only when all ordered units arrived.', 'Check that the order is marked received and its stock is reflected in Inventory.'], note: 'Warehouse Staff receives approved orders but does not create, approve, or cancel them.' },
      { id: 'warehouse-count', topic: 'counts', title: 'Verify physical stock and fix a mismatch', summary: 'Reconcile only after confirming the displayed physical quantity.', steps: ['Locate the product’s Count Mismatch in Inventory.', 'Verify the actual stock and investigate missing receipts, dispatches, or damage.', 'If the displayed physical quantity is correct, select Fix Count to align the recorded count.', 'Check the resolved mismatch. Report an unexplained difference to Admin or through Contact Support.'], note: 'Do not make unrestricted catalog or quantity edits. Stock movements and reconciliation must remain traceable.' },
      { id: 'warehouse-qr', topic: 'batches', title: 'Generate or scan a product QR label', summary: 'Identify existing catalog products by SKU.', steps: ['Select Generate QR in Inventory, choose the product, and check its SKU.', 'Select Download QR (SVG) to create the label.', 'For stock operations, allow camera access and scan the label. If decoding fails, type the SKU manually or select Restart camera.'], note: 'Scanning needs HTTPS or localhost and a compatible browser. Ask Admin to add unknown SKUs before recording stock.' },
      { id: 'warehouse-expiry', topic: 'batches', title: 'Review batch quantities and expiry risk', summary: 'Check batch location and expiry before handling goods.', steps: ['Review the FIFO / FEFO expiry queue in Inventory.', 'Check the product, batch quantity, bin, and expiry date.', 'Follow company policy for picking and for handling expired or expiring goods, and record any stock operation through its authorized workflow.'], note: 'Opening a batch does not change stock. Do not ship expired goods simply to clear an expiry alert.' },
    ],
  },
  purchasing: {
    title: 'Purchasing Manager task guides', description: 'Coordinate suppliers, create purchase orders, and plan replenishment.',
    topics: [
      { id: 'planning', title: 'Replenishment planning', description: 'Review stock activity and outstanding orders.' },
      { id: 'orders', title: 'Suppliers & purchase orders', description: 'Create and maintain supplier orders.' },
    ],
    articles: [
      { id: 'purchasing-start', topic: 'planning', title: 'Review purchasing needs', summary: 'Check recorded stock activity before arranging replenishment.', steps: ['Review Dashboard stock activity and inventory alerts.', 'Check current stock availability and relevant batch expiry information in Inventory.', 'Review pending and approved purchase orders before placing another order for the same product.'], note: 'Purchasing Manager cannot directly adjust stock, edit product pricing, or manage user accounts.' },
      { id: 'purchasing-planning', topic: 'planning', title: 'Plan replenishment from recorded activity', summary: 'Combine WBA records with your company’s reorder policy.', steps: ['Compare monthly receipts and dispatches on Dashboard.', 'Review current stock, alerts, and expected deliveries.', 'Use these records and your company’s reorder policy to decide the next order quantity.'], note: 'The chart is historical activity. Dedicated demand forecasts and configurable reorder-point screens are not currently available.' },
      { id: 'purchasing-supplier', topic: 'orders', title: 'Add a supplier for an order', summary: 'Save a supplier name within the order form.', steps: ['Open Purchase history and select + New order.', 'Choose an existing supplier, or enter a name under Add a supplier.', 'Select Save supplier and confirm the saved supplier is selected.'], note: 'The current form saves a supplier name; it does not provide a separate full supplier-profile editing screen.' },
      { id: 'purchasing-create', topic: 'orders', title: 'Create a purchase order for approval', summary: 'Specify the supplier, product, quantity, and unit cost.', steps: ['Select + New order in Purchase history and choose the supplier.', 'Select the catalog product and enter the quantity, unit cost, expected delivery date, and notes.', 'Select Submit for approval and check the resulting pending order.'], note: 'Admin approves the order. Admin or Warehouse Staff records delivery; creating an order does not increase stock.' },
      { id: 'purchasing-track', topic: 'orders', title: 'Track or cancel a supplier order', summary: 'Follow order status without changing warehouse quantities.', steps: ['Search Purchase history by order, supplier, or product.', 'Filter by pending approval, approved, received, or cancelled to check progress.', 'Use Cancel on a pending or approved order if it should not proceed, then verify its status.'], note: 'Ask Admin about approvals and Warehouse Staff about delivery confirmation. You cannot approve or receive an order as Purchasing Manager.' },
    ],
  },
  sales: {
    title: 'Sales Staff task guides', description: 'Check pricing, availability, and product information before making customer commitments.',
    topics: [{ id: 'sales', title: 'Product enquiries & availability', description: 'Read product information and escalate stock questions.' }],
    articles: [
      { id: 'sales-start', topic: 'sales', title: 'Review availability before serving customers', summary: 'Start with the Sales dashboard’s stock summaries.', steps: ['Open Dashboard and check Available to sell, Customer reservations, and Catalog products.', 'Open Inventory to confirm the individual product’s current information.', 'Use recorded stock information when answering a customer enquiry.'], note: 'Sales Staff has read-only access. Sales cannot change stock, catalog records, purchasing, or accounts.' },
      { id: 'sales-price', topic: 'sales', title: 'Check a product’s price', summary: 'Use the inventory ledger to confirm product details.', steps: ['Locate the product name and SKU in Inventory.', 'Read its listed unit price.', 'If the price appears incorrect, ask Admin to verify it before quoting the customer.'], note: 'Do not promise an unrecorded price change. Catalog and pricing changes belong to Admin.' },
      { id: 'sales-atp', topic: 'sales', title: 'Understand available-to-sell stock', summary: 'Distinguish physical stock from units that can still be promised.', steps: ['Read the product’s on-hand, reserved, and picking-allocation quantities.', 'Available to sell is on-hand minus reserved and allocated units, with a minimum of zero.', 'If no stock is available, check with the relevant team before promising fulfillment.'], note: 'The Sales workspace displays reservations and allocations; it does not provide controls to create or release them.' },
      { id: 'sales-discrepancy', topic: 'sales', title: 'Report a stock or product discrepancy', summary: 'Escalate inaccurate information while preserving the recorded inventory.', steps: ['Note the SKU, displayed quantity or price, time, and the information that appears wrong.', 'Ask Warehouse Staff about physical-stock differences or Admin about catalog and pricing issues.', 'If the issue persists, open Contact Support and send a request with the affected page and expected result.'], note: 'Sales Staff cannot use Fix Count, receive stock, dispatch stock, or edit the catalog.' },
    ],
  },
};

function matchesHelpArticle(article, topic, query) {
  const search = query.trim().toLowerCase();
  return (topic === 'all' || article.topic === topic) &&
    [article.title, article.summary, article.note, ...article.steps].join(' ').toLowerCase().includes(search);
}

export function findHelpArticles({ role, topic = 'all', query = '' }) {
  return filterHelpArticles(ROLE_HELP[role]?.articles || [], { topic, query });
}

export function findGeneralHelpArticles({ topic = 'all', query = '' } = {}) {
  return filterHelpArticles(GENERAL_HELP_ARTICLES, { topic, query });
}

export function filterHelpArticles(articles, { topic = 'all', query = '' } = {}) {
  return articles.filter(article => matchesHelpArticle(article, topic, query));
}
