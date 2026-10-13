import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { isDialogBackdrop } from '../src/utils/dialogBackdrop.js';

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true, ws: false },
  appType: 'custom',
  ssr: { external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'] },
});
after(() => server.close());
const { default: ApiStatus } = await server.ssrLoadModule('/src/components/ApiStatus.jsx');
const { Skeleton, SkeletonText } = await server.ssrLoadModule('/src/components/SkeletonLoader.jsx');
const { default: InventoryLedger } = await server.ssrLoadModule('/src/components/dashboard/RealTimeInventoryLedger.jsx');
const { default: ProductLifecycleDialog } = await server.ssrLoadModule('/src/components/dashboard/ProductLifecycleDialog.jsx');
const { default: ProductReportsDialog } = await server.ssrLoadModule('/src/components/dashboard/ProductReportsDialog.jsx');
const { default: DashboardSidebar } = await server.ssrLoadModule('/src/components/dashboard/DashboardSidebar.jsx');
const { default: AuditLogsSection } = await server.ssrLoadModule('/src/components/dashboard/AuditLogsSection.jsx');
const { default: AddProductModal } = await server.ssrLoadModule('/src/components/dashboard/AddProductModal.jsx');
const { default: NotificationDrawer } = await server.ssrLoadModule('/src/components/dashboard/NotificationDrawer.jsx');
const { isTabAllowed, hasPermission, PERMISSIONS } = await server.ssrLoadModule('/src/data/rbac.js');
const render = (Component, props, children) => renderToStaticMarkup(createElement(Component, props, children));

test('mobile navigation retains permitted labels after the desktop sidebar was collapsed', () => {
  for (const role of ['admin', 'warehouse', 'purchasing', 'sales']) {
    const html = render(DashboardSidebar, { currentUser: { accessLevel: role }, isCollapsed: true, isMobileOpen: true });
    assert.match(html, /Workspace navigation/);
    assert.doesNotMatch(html, /wba-dash-sidebar collapsed/);
    for (const [tab, label] of [['dashboard', 'Dashboard'], ['inventory', 'Inventory'], ['purchase-history', 'Purchase history'], ['audit-logs', 'Audit logs'], ['manage-accounts', 'Manage Accounts'], ['help-center', 'Help center']]) {
      const visibleLabel = `class="wba-dash-nav-label">${label}</span>`;
      assert.equal(html.includes(visibleLabel), isTabAllowed(role, tab));
    }
    const desktop = render(DashboardSidebar, { currentUser: { accessLevel: role }, isCollapsed: true });
    assert.match(desktop, /wba-dash-sidebar collapsed/);
    assert.doesNotMatch(desktop, /class="wba-dash-nav-label"/);
  }
});

test('purchase order expected-delivery field spans the form grid', async () => {
  const source = await readFile(new URL('../src/components/dashboard/PurchaseHistorySection.jsx', import.meta.url), 'utf8');
  assert.match(source, /name === 'expected_delivery_date' \? 'wba-input-group full-width' : 'wba-input-group'/);
});

test('pending API data shows a skeleton and one contextual loading announcement', () => {
  const html = render(ApiStatus, { loading: true, loadingLabel: 'Loading inventory…' });
  assert.match(html, /wba-skeleton/);
  assert.match(html, /Loading inventory…/);
  assert.equal((html.match(/role="status"/g) || []).length, 1);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /<button|<input|<select/);
});

test('loading displays the section placeholder supplied by its caller', () => {
  const html = render(ApiStatus, { loading: true }, createElement(SkeletonText, { lines: 2 }));
  assert.equal((html.match(/class="wba-skeleton /g) || []).length, 2);
});

test('an API error keeps the retry action and takes priority over loading', () => {
  const html = render(ApiStatus, { loading: true, error: 'Connection unavailable', onRetry: () => {} });
  assert.match(html, /role="alert"/);
  assert.match(html, /Connection unavailable/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /wba-skeleton|aria-busy/);
});

test('completed requests remove the loading status', () => {
  assert.equal(render(ApiStatus, { loading: false, error: '' }), '');
});

test('placeholder primitives stay decorative and respect zero dimensions', () => {
  const html = render(Skeleton, { width: 0, height: 0, 'aria-hidden': false });
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /width:0px/);
  assert.match(html, /height:0px/);
});

const product = { id: 1, name: 'Test appliance', sku: 'TEST-001', category: 'A', warehouseBin: 'BIN-01', unitPrice: 100,
  physicalOnHand: 0, paperSpreadsheetCount: 0, reserved: 0, allocated: 0, canArchive: true };

test('product entry keeps the SKU preview read-only and labels concise', () => {
  const html = render(AddProductModal, { isOpen: true, onClose: () => {}, onAddProduct: () => {} });
  assert.match(html, /for="product-sku-preview">SKU<\/label>/);
  assert.match(html, /id="product-sku-preview"[^>]*readOnly=""/);
  assert.match(html, /wba-input-label">Cost<\/span>/);
  assert.match(html, /Track batches and expiry/);
  assert.match(html, /Movement rate/);
  assert.doesNotMatch(html, /generated automatically|Based on expiry tracking|How quickly stock|Enter the product details|Storage cost per unit|movement-rate-help|name="sku"|name="category"|Classification/);
});

test('notification cards separate severity and expiry details and retain viewed alerts', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const expiry = [tomorrow.getFullYear(), String(tomorrow.getMonth() + 1).padStart(2, '0'), String(tomorrow.getDate()).padStart(2, '0')].join('-');
  const html = render(NotificationDrawer, { isOpen: true, notifications: [{ id: 'expiry-1', version: 'one', isRead: true,
    type: 'expiry', product: 'Air Conditioner', sku: 'WBA-EXP-001', severity: 'critical', lot: 'LOT-long-identifier',
    expiresAt: expiry, daysLeft: 1, quantity: 5 }], onClose: () => {}, onViewed: () => {} });
  assert.match(html, /No new notifications/);
  assert.match(html, /<details[^>]*><summary>Viewed alerts/);
  assert.match(html, /Critical/);
  assert.match(html, /Expires tomorrow · 5 units/);
  assert.match(html, /<dt>Batch<\/dt><dd>LOT-long-identifier<\/dd>/);
  assert.ok(html.includes('<time dateTime="' + expiry + '">'));
});

test('notification dismissal detects backdrop taps without dismissing panel content', () => {
  const dialog = { getBoundingClientRect: () => ({ left: 280, right: 728, top: 0, bottom: 874 }) };
  const pointer = (clientX, clientY, target = dialog) => ({ target, currentTarget: dialog, clientX, clientY });
  assert.equal(isDialogBackdrop(pointer(100, 400)), true);
  assert.equal(isDialogBackdrop(pointer(740, 400)), true);
  assert.equal(isDialogBackdrop(pointer(400, -1)), true);
  assert.equal(isDialogBackdrop(pointer(400, 875)), true);
  assert.equal(isDialogBackdrop(pointer(400, 400)), false);
  assert.equal(isDialogBackdrop(pointer(280, 400)), false);
  assert.equal(isDialogBackdrop(pointer(728, 400)), false);
  assert.equal(isDialogBackdrop(pointer(400, 400, {})), false);
});

test('unclassified products are not mislabeled as perishable', () => {
  const html = render(InventoryLedger, { items: [{ ...product, category: 'U' }], currentUser: { accessLevel: 'admin' } });
  assert.match(html, /Unclassified/);
  assert.doesNotMatch(html, /Perishable/);
});

test('ledger keeps count status separate from actions and archive descriptions inside the dialog', () => {
  const html = render(InventoryLedger, { items: [product, { ...product, id: 2, name: 'Stocked appliance', physicalOnHand: 1,
    canArchive: false, archiveBlockReason: 'Resolve stock first.' }], currentUser: { accessLevel: 'admin' }, onArchive: () => {} });
  assert.match(html, /aria-label="Archive Test appliance"/);
  assert.doesNotMatch(html, /disabled="" aria-label="Archive Stocked appliance"/);
  assert.doesNotMatch(html, /archive-blocked-|Resolve stock first\.|✓ OK/);
  assert.match(html, /<th>Count status<\/th>/);
  assert.match(html, /aria-label="View reports for Test appliance"/);
});

test('warehouse staff can add product reports while other roles cannot', () => {
  for (const accessLevel of ['admin', 'warehouse', 'purchasing', 'sales']) {
    const html = render(InventoryLedger, { items: [product], currentUser: { accessLevel }, onReports: () => {} });
    assert.equal(html.includes('aria-label="Add report for Test appliance"'), accessLevel === 'warehouse');
    assert.equal(html.includes('aria-label="View reports for Test appliance"'), ['admin', 'warehouse'].includes(accessLevel));
  }
});

test('warehouse report forms require a description while admins can only review history', () => {
  const warehouse = render(ProductReportsDialog, { item: product, currentUser: { accessLevel: 'warehouse' }, onClose: () => {} });
  assert.match(warehouse, /Description \(required\)/);
  assert.match(warehouse, /Info \/ note/);
  assert.match(warehouse, /Mismatch/);
  assert.match(warehouse, /does not change stock quantities/);
  const admin = render(ProductReportsDialog, { item: product, currentUser: { accessLevel: 'admin' }, onClose: () => {} });
  assert.match(admin, /Report history/);
  assert.doesNotMatch(admin, /Save report|<textarea/);
});

test('blocked archive dialogs explain the stock balance without offering a submit action', () => {
  const html = render(ProductLifecycleDialog, { action: 'archive', item: { ...product, physicalOnHand: 5, paperSpreadsheetCount: 5,
    canArchive: false, archiveBlockReason: 'Stock and commitments must be zero.' }, onClose: () => {} });
  assert.match(html, /Stock and commitments must be zero\./);
  assert.match(html, /Physical stock<\/dt><dd>5<\/dd>/);
  assert.match(html, /Ledger count<\/dt><dd>5<\/dd>/);
  assert.match(html, /Back to inventory/);
  assert.doesNotMatch(html, /<textarea|type="submit"/);
});

test('eligible archive and restore dialogs still offer their required reason and submit action', () => {
  for (const action of ['archive', 'restore']) {
    const html = render(ProductLifecycleDialog, { action, item: product, onClose: () => {} });
    assert.match(html, /<textarea/);
    assert.match(html, /Reason \(required\)/);
    assert.match(html, /type="submit"/);
  }
});

test('warehouse, purchasing, and sales users do not see archive controls', () => {
  for (const accessLevel of ['warehouse', 'purchasing', 'sales']) {
    const html = render(InventoryLedger, { items: [product], currentUser: { accessLevel } });
    assert.doesNotMatch(html, /aria-label="Archive/);
  }
});

test('only administrators can navigate to audit logs or mount their data view', () => {
  for (const accessLevel of ['admin', 'purchasing', 'warehouse', 'sales']) {
    const allowed = accessLevel === 'admin';
    assert.equal(isTabAllowed(accessLevel, 'audit-logs'), allowed);
    assert.equal(hasPermission(accessLevel, PERMISSIONS.VIEW_AUDIT_LOGS), allowed);
    const sidebar = render(DashboardSidebar, { currentUser: { accessLevel }, activeTab: 'dashboard' });
    assert.equal(sidebar.includes('Audit logs'), allowed);
    if (!allowed) {
      const audit = render(AuditLogsSection, { currentUser: { accessLevel } });
      assert.match(audit, /Only administrators can view audit logs\./);
      assert.doesNotMatch(audit, /Loading audit logs/);
    }
  }
  assert.match(render(AuditLogsSection, {}), /Only administrators can view audit logs\./);
});
