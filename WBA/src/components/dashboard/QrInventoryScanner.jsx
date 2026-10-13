import { useEffect, useRef, useState } from 'react';
import WorkspaceDialog from '../WorkspaceDialog';

export default function QrInventoryScanner({ isOpen, onClose, onScan, products }) {
  const video = useRef(null);
  const stream = useRef(null);
  const frame = useRef(null);
  const generation = useRef(0);
  const [code, setCode] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [lot, setLot] = useState('');
  const [type, setType] = useState('stock_in');
  const [camera, setCamera] = useState('idle');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const product = products.find(item => item.sku.toLowerCase() === code.trim().toLowerCase());
  const scannedProduct = products.find(item => item.sku.toLowerCase() === scannedCode.toLowerCase());
  const stop = () => {
    generation.current++;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
  };
  const start = async () => {
    stop();
    const ticket = generation.current;
    setScannedCode('');
    setError('');
    setCamera('opening');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (ticket !== generation.current) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      video.current.srcObject = media;
      await video.current.play();
      if (ticket !== generation.current) return;
      setCamera('preview');
      if (!window.BarcodeDetector) { setError('This browser cannot decode QR codes. Enter the SKU below.'); return; }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      setCamera('scanning');
      const detect = async () => {
        if (ticket !== generation.current || !video.current) return;
        try {
          const results = await detector.detect(video.current);
          if (ticket !== generation.current) return;
          const scanned = results[0]?.rawValue?.trim();
          if (scanned) {
            setCode(scanned); setScannedCode(scanned); stop(); setCamera('idle');
            return;
          }
          frame.current = requestAnimationFrame(detect);
        } catch { if (ticket !== generation.current) return; stop(); setCamera('idle'); setError('QR decoding failed. Enter the SKU manually.'); }
      };
      detect();
    } catch { if (ticket === generation.current) { stop(); setCamera('idle'); setError('Camera unavailable. Allow access or enter the SKU manually.'); } }
  };
  useEffect(() => {
    const opening = isOpen ? requestAnimationFrame(() => start()) : null;
    return () => { cancelAnimationFrame(opening); stop(); };
  }, [isOpen]);
  if (!isOpen) return null;
  const close = () => { if (saving) return; stop(); setScannedCode(''); setCode(''); setError(''); onClose(); };
  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    if (!product) return setError('This SKU is not in the catalog. Ask an administrator to add the product first.');
    setSaving(true); setError('');
    try {
      await onScan({ code: product.sku, quantity: Number(quantity), type, expiresAt: type === 'stock_in' && product.shelfLifeMonths ? expiresAt : null, lot: lot.trim() || null });
      stop(); setCode(''); setScannedCode(''); setQuantity(1); setExpiresAt(''); setLot(''); onClose();
    } catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };
  return <WorkspaceDialog onClose={close} labelledBy="scan-title" closeLabel="Close scanner" busy={saving} className="wba-qr-scanner-modal">
    <h2 id="scan-title">Scan Product</h2>
    <div className="wba-qr-camera-frame">
      <video ref={video} muted playsInline hidden={Boolean(scannedCode)} />
      {camera === 'opening' && <span>Opening camera…</span>}
      <div role="status" aria-atomic="true" className={'wba-qr-scan-result' + (scannedProduct ? ' is-success' : '')}>
        {scannedCode && <>
          <span className="wba-qr-result-icon" aria-hidden="true">{scannedProduct ? '✓' : '?'}</span>
          <strong>{scannedProduct ? 'Scan complete' : 'Product not found'}</strong>
          {scannedProduct && <span>{scannedProduct.name}</span>}
          <span className="wba-qr-result-sku">{scannedCode}</span>
        </>}
      </div>
    </div>
    <button type="button" className="wba-pill-btn" onClick={start} disabled={saving || camera === 'opening'}>{scannedCode ? 'Scan again' : 'Restart camera'}</button>
    <form onSubmit={submit}>
      <label className="wba-input-group"><span className="wba-input-label">SKU</span><input className="wba-input-field" required value={code} onChange={event => { setCode(event.target.value); setScannedCode(''); setError(''); }} /></label>
      {product && <p>{product.name} · {product.physicalOnHand} units on hand</p>}
      <label className="wba-input-group"><span className="wba-input-label">Operation</span><select className="wba-input-field" value={type} onChange={event => setType(event.target.value)}><option value="stock_in">Receive stock</option><option value="stock_out">Dispatch stock</option></select></label>
      <label className="wba-input-group"><span className="wba-input-label">Quantity</span><input className="wba-input-field" type="number" min="1" step="1" required value={quantity} onChange={event => setQuantity(event.target.value)} /></label>
      {product?.shelfLifeMonths && type === 'stock_in' && <>
        <label className="wba-input-group"><span className="wba-input-label">Batch expiry date</span><input className="wba-input-field" type="date" required value={expiresAt} onChange={event => setExpiresAt(event.target.value)} /></label>
        <label className="wba-input-group"><span className="wba-input-label">Lot number (optional)</span><input className="wba-input-field" value={lot} onChange={event => setLot(event.target.value)} /></label>
      </>}
      {(error || (scannedCode && !scannedProduct)) && <p role="alert" className="wba-modal-error">{error || 'No product matches this QR code. Scan again or enter a SKU.'}</p>}
      <div className="wba-qr-scanner-actions"><button type="button" className="wba-pill-btn" disabled={saving} onClick={close}>Cancel</button><button className="wba-btn-primary" disabled={saving || !product}>{saving ? 'Saving…' : type === 'stock_in' ? 'Receive stock' : 'Dispatch stock'}</button></div>
    </form>
  </WorkspaceDialog>;
}
