import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';


export default function ProductQrGenerator({ isOpen, onClose, products }) {
  const [choice, setSelectedSku] = useState('');
  const selectedSku = products.some(item => item.sku === choice) ? choice : products[0]?.sku || '';
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const product = products.find((item) => item.sku === selectedSku);

  useEffect(() => {
    if (!isOpen || !selectedSku) return undefined;
    let active = true;
    QRCode.toString(selectedSku, { type: 'svg', width: 280, margin: 2, errorCorrectionLevel: 'M' })
      .then((code) => {
        if (active) {
          setSvg(code);
          setError('');
        }
      })
      .catch(() => {
        if (active) {
          setSvg('');
          setError('Could not generate this QR code. Try another product.');
        }
      });
    return () => { active = false; };
  }, [isOpen, selectedSku]);

  const downloadLabel = () => {
    if (!svg || !product) return;
    const file = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.sku}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="wba-dash-modal-overlay" onClick={onClose}>
      <div className="wba-dash-modal-card wba-qr-generator-modal" role="dialog" aria-modal="true" aria-labelledby="qr-generator-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="wba-modal-close-btn" onClick={onClose} aria-label="Close QR generator">&times;</button>
        <div className="wba-qr-scanner-heading">
          <span className="wba-qr-scanner-icon">▦</span>
          <div>
            <h2 id="qr-generator-title">Product QR label</h2>
          </div>
        </div>

        <div className="wba-input-group">
          <label className="wba-input-label" htmlFor="qr-product">Product</label>
          <select id="qr-product" className="wba-input-field" value={selectedSku} onChange={(event) => { setSelectedSku(event.target.value); setSvg(''); }}>
            {products.map((item) => (
              <option key={item.sku} value={item.sku}>{item.name} — {item.sku}</option>
            ))}
          </select>
        </div>

        <div className="wba-qr-label-preview" aria-live="polite">
          <div className="wba-qr-preview-code">
            {svg ? <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`QR code for ${product?.name}, SKU ${selectedSku}`} /> : <span>{!selectedSku ? 'Add a product before generating a QR label.' : error || 'Generating QR code…'}</span>}
          </div>
          <div className="wba-qr-preview-details">
            <strong>{product?.name}</strong>
            <code>{selectedSku}</code>
          </div>
        </div>
        {error && <p className="wba-qr-scanner-error" role="alert">{error}</p>}
        <div className="wba-qr-scanner-actions">
          <button type="button" className="wba-pill-btn" onClick={onClose}>Close</button>
          <button type="button" className="wba-btn-primary" onClick={downloadLabel} disabled={!svg || !product}>Download QR (SVG)</button>
        </div>
      </div>
    </div>
  );
}
