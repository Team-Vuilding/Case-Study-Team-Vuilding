import { useState } from 'react';
import WorkspaceDialog from '../WorkspaceDialog';
import { apiRequest, refreshData } from '../../services/api';
import useApiData from '../../services/useApiData';
import ApiStatus from '../ApiStatus';
import { SkeletonForm, SkeletonHeading, SkeletonTable } from '../WorkspaceSkeletons';

function OrderForm({ onClose }) {
  const products = useApiData('items');
  const suppliers = useApiData('purchasing/suppliers');
  const [form, setForm] = useState({ supplier_id: '', item_id: '', quantity: '1', unit_price: '', expected_delivery_date: '', notes: '' });
  const [supplierName, setSupplierName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async event => {
    event.preventDefault(); if (saving) return; setSaving(true); setError('');
    try {
      await apiRequest('purchasing/purchase-orders', { method: 'POST', body: {
        supplier_id: Number(form.supplier_id), expected_delivery_date: form.expected_delivery_date || null, notes: form.notes,
        items: [{ item_id: Number(form.item_id), quantity: Number(form.quantity), unit_price: Number(form.unit_price) }],
      } });
      refreshData(); onClose();
    } catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };
  const addSupplier = async () => {
    if (!supplierName.trim() || saving) return;
    setSaving(true); setError('');
    try { const result = await apiRequest('purchasing/suppliers', { method: 'POST', body: { name: supplierName.trim() } }); setForm({ ...form, supplier_id: String(result.data.id) }); setSupplierName(''); suppliers.reload(); }
    catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  return <WorkspaceDialog onClose={onClose} labelledBy="po-title" busy={saving} className="wba-order-form"><h2 id="po-title">New purchase order</h2>
    {products.loading || suppliers.loading || products.error || suppliers.error ? <ApiStatus loading={products.loading || suppliers.loading} error={products.error || suppliers.error} onRetry={() => { products.reload(); suppliers.reload(); }} loadingLabel="Loading purchase order options…"><SkeletonForm /></ApiStatus> : <>
      <label className="wba-input-group"><span className="wba-input-label">Add a supplier</span><input className="wba-input-field" value={supplierName} onChange={event => setSupplierName(event.target.value)} placeholder="Supplier name" /></label>
      <button type="button" className="wba-pill-btn" disabled={saving || !supplierName.trim()} onClick={addSupplier}>Save supplier</button>
      <form onSubmit={submit}>
        <label className="wba-input-group"><span className="wba-input-label">Supplier</span><select className="wba-input-field" name="supplier_id" required value={form.supplier_id} onChange={update}><option value="">Select a supplier</option>{suppliers.data.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="wba-input-group"><span className="wba-input-label">Product</span><select className="wba-input-field" name="item_id" required value={form.item_id} onChange={update}><option value="">Select a product</option>{products.data.map(item => <option key={item.id} value={item.id}>{item.name} — {item.sku}</option>)}</select></label>
        <div className="wba-form-grid">{[['quantity', 'Quantity', 'number'], ['unit_price', 'Unit cost (₱)', 'number'], ['expected_delivery_date', 'Expected delivery', 'date']].map(([name, label, type]) => <label key={name} className={name === 'expected_delivery_date' ? 'wba-input-group full-width' : 'wba-input-group'}><span className="wba-input-label">{label}</span><input className="wba-input-field" name={name} type={type} required={name !== 'expected_delivery_date'} value={form[name]} onChange={update} min={name === 'quantity' ? 1 : name === 'unit_price' ? 0 : undefined} step={name === 'unit_price' ? '0.01' : undefined} /></label>)}</div>
        <label className="wba-input-group"><span className="wba-input-label">Notes</span><textarea className="wba-input-field" name="notes" value={form.notes} onChange={update} /></label>
        <button className="wba-btn-primary" disabled={saving || !products.data.length}>{saving ? 'Saving…' : 'Submit for approval'}</button>
      </form>
    </>}
    {error && <p role="alert" className="wba-modal-error">{error}</p>}
  </WorkspaceDialog>;
}

export default function PurchaseHistorySection({ currentUser }) {
  const orders = useApiData('purchasing/purchase-orders');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [cancellation, setCancellation] = useState(null);
  const [expiry, setExpiry] = useState('');
  const role = currentUser.accessLevel;
  const canCreate = ['admin', 'purchasing'].includes(role);
  const costs = canCreate;
  const changeStatus = async (order, status, expiresAt = null) => {
    if (pending) return;
    setPending(order.id); setError('');
    try { await apiRequest('purchasing/purchase-orders/' + order.id + '/status', { method: 'PUT', body: { status, expiresAt } }); refreshData(); setDelivery(null); setCancellation(null); setExpiry(''); }
    catch (reason) { setError(reason.message); } finally { setPending(null); }
  };
  if (orders.loading || orders.error) return <ApiStatus loading={orders.loading} error={orders.error} onRetry={orders.reload} loadingLabel="Loading purchase orders…">
    <div className="wba-grid-container"><SkeletonHeading /><SkeletonTable columns={costs ? 6 : 5} /></div>
  </ApiStatus>;
  const filtered = orders.data.filter(order => (filter === 'all' || order.status === filter) && (order.number + order.supplier + order.lines.map(line => line.product).join(' ')).toLowerCase().includes(search.toLowerCase()));
  return <div className="wba-grid-container">
    <div className="wba-section-page-header"><div><h2 className="wba-section-page-title wba-toolbar-title">Purchase orders</h2></div>{canCreate && <button type="button" className="wba-btn-primary" onClick={() => setOpen(true)}>+ New order</button>}</div>
    <div className="wba-accounts-filters"><input className="wba-input-field" type="search" aria-label="Search purchase orders" placeholder="Search order, product, supplier" value={search} onChange={event => setSearch(event.target.value)} /><select className="wba-input-field" aria-label="Order status" value={filter} onChange={event => setFilter(event.target.value)}>{['all', 'pending_approval', 'approved', 'received', 'cancelled'].map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></div>
    {error && <p role="alert">{error}</p>}
    <section className="wba-glow-card wba-purchase-history-card" aria-labelledby="purchase-history-title">
      <h2 id="purchase-history-title" className="wba-card-heading">Purchase history</h2>
      {!filtered.length && <p>No purchase orders match your filters.</p>}
      <div className="wba-table-container" tabIndex={0} role="region" aria-label="Purchase orders"><table className="wba-table wba-purchase-table"><thead><tr><th>Order / supplier</th><th>Products</th><th>Delivery</th>{costs && <th>Amount</th>}<th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(order => <tr key={order.id}>
        <td><strong className="wba-order-identity">{order.number}</strong><span className="wba-sku-code">{order.supplier}</span></td><td data-label="Products">{order.lines.map(line => <div key={line.id}>{line.product} · {line.quantity} units{costs ? ' × ₱' + line.unitCost.toLocaleString() : ''}</div>)}</td><td data-label="Delivery">{order.expectedDelivery || 'Not scheduled'}</td>{costs && <td data-label="Amount">₱{order.totalCost.toLocaleString()}</td>}<td data-label="Status">{order.status.replaceAll('_', ' ')}</td><td><div className="wba-order-actions">
          {role === 'admin' && order.status === 'pending_approval' && <button type="button" className="wba-pill-btn" disabled={Boolean(pending)} onClick={() => changeStatus(order, 'approved')}>Approve</button>}
          {['admin', 'warehouse'].includes(role) && order.status === 'approved' && <button type="button" className="wba-pill-btn" disabled={Boolean(pending)} onClick={() => setDelivery(order)}>Receive delivery</button>}
          {canCreate && ['pending_approval', 'approved'].includes(order.status) && <button type="button" className="wba-pill-btn wba-action-danger" disabled={Boolean(pending)} onClick={() => { setError(''); setCancellation(order); }}>Cancel order</button>}
        </div></td></tr>)}</tbody></table></div>
      <p className="wba-purchase-summary">{filtered.length} {filtered.length === 1 ? 'order' : 'orders'}{costs ? ' · ₱' + filtered.reduce((sum, order) => sum + order.totalCost, 0).toLocaleString() + ' total' : ''}</p>
    </section>
    {open && <OrderForm onClose={() => setOpen(false)} />}
    {delivery && <WorkspaceDialog onClose={() => setDelivery(null)} labelledBy="delivery-title" busy={Boolean(pending)}><h2 id="delivery-title">Confirm delivery</h2><p>{delivery.number}</p><p>Confirm all ordered units have arrived. For perishable products, enter the actual expiry date.</p><label className="wba-input-group"><span className="wba-input-label">Expiry date (if perishable)</span><input className="wba-input-field" type="date" value={expiry} onChange={event => setExpiry(event.target.value)} /></label>{error && <p role="alert">{error}</p>}<div className="wba-accounts-form-actions"><button type="button" className="wba-pill-btn" disabled={Boolean(pending)} onClick={() => setDelivery(null)}>Back</button><button type="button" className="wba-btn-primary" disabled={Boolean(pending)} onClick={() => changeStatus(delivery, 'received', expiry || null)}>{pending ? 'Saving…' : 'Confirm receipt'}</button></div></WorkspaceDialog>}
    {cancellation && <WorkspaceDialog onClose={() => setCancellation(null)} labelledBy="cancel-order-title" busy={Boolean(pending)}>
      <h2 id="cancel-order-title">Cancel this order?</h2><p className="wba-order-reference">{cancellation.number}</p><p>The order will stay in history and cannot be reopened.</p>
      {error && <p role="alert" className="wba-modal-error">{error}</p>}
      <div className="wba-accounts-form-actions"><button type="button" className="wba-pill-btn" disabled={Boolean(pending)} onClick={() => setCancellation(null)}>Keep order</button><button type="button" className="wba-btn-primary wba-danger-button" disabled={Boolean(pending)} onClick={() => changeStatus(cancellation, 'cancelled')}>{pending ? 'Cancelling…' : 'Cancel order'}</button></div>
    </WorkspaceDialog>}
  </div>;
}
