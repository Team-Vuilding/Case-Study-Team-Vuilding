import React, { useEffect, useRef, useState } from 'react';
import { INITIAL_INVENTORY_ITEMS } from '../../data/mockInventoryData';

export default function QrInventoryScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cameraState, setCameraState] = useState('idle');
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [matching, setMatching] = useState(false);

  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraState('idle');
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError('');
    if (streamRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported here. Enter the QR/SKU value manually.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraState('preview');
      if (!('BarcodeDetector' in window)) {
        setError('Camera preview is available, but this browser cannot decode QR codes. Enter the detected SKU manually.');
        return;
      }
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      setCameraState('scanning');

      const detect = async () => {
        if (!videoRef.current || !streamRef.current) return;
        const codes = await detector.detect(videoRef.current);
        if (codes[0]?.rawValue) {
          setCode(codes[0].rawValue.trim());
          setSuggestion(null);
          stopCamera();
          return;
        }
        animationRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch {
      setError('We could not open your camera. Allow camera access in your browser, then try again; you can also enter the QR/SKU value manually.');
      stopCamera();
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const openCamera = requestAnimationFrame(() => startCamera());
    return () => cancelAnimationFrame(openCamera);
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const scannedCode = code.trim();
    if (!scannedCode) {
      setError('Scan a QR code or enter a SKU before adding stock.');
      return;
    }
    const receivedQuantity = Number(quantity);
    if (!Number.isSafeInteger(receivedQuantity) || receivedQuantity < 1) {
      setError('Enter a whole-number quantity of at least 1.');
      return;
    }
    const exact = INITIAL_INVENTORY_ITEMS.find((item) => item.sku.toLowerCase() === scannedCode.toLowerCase());
    if (!exact && suggestion?.label !== scannedCode) {
      setMatching(true);
      setError('');
      try {
        const response = await fetch('/api/typesafe/scan-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: scannedCode }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Product lookup unavailable');
        const product = INITIAL_INVENTORY_ITEMS.find((item) => item.sku === result.suggestion);
        if (!product) throw new Error('No reliable product match. Check the SKU on the item label before receiving stock.');
        setSuggestion({ label: scannedCode, product });
      } catch (lookupError) {
        setError(lookupError.message);
      } finally {
        setMatching(false);
      }
      return;
    }
    onScan({ code: exact?.sku || suggestion.product.sku, quantity: receivedQuantity, originalLabel: scannedCode });
    stopCamera();
    setCode('');
    setSuggestion(null);
    setQuantity(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="wba-dash-modal-overlay" onClick={() => { stopCamera(); onClose(); }}>
      <div className="wba-dash-modal-card wba-qr-scanner-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="wba-modal-close-btn" onClick={() => { stopCamera(); onClose(); }} aria-label="Close QR scanner">&times;</button>
        <div className="wba-qr-scanner-heading">
          <span className="wba-qr-scanner-icon">⌘</span>
          <div>
            <h2>Scan stock into inventory</h2>
            <p>Scan a QR label that contains an existing SKU, then confirm the received quantity.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="wba-qr-camera-frame">
            <video ref={videoRef} muted playsInline className={cameraState === 'idle' ? 'wba-qr-camera-hidden' : ''} />
            {cameraState === 'idle' && <span>{error ? 'Camera could not be opened' : 'Opening your device camera…'}</span>}
          </div>
          <button type="button" className="wba-pill-btn wba-qr-camera-button" onClick={startCamera} disabled={cameraState !== 'idle'}>
            {cameraState === 'scanning' ? 'Point camera at QR code' : cameraState === 'preview' ? 'Camera ready' : error ? 'Retry camera' : 'Opening camera…'}
          </button>

          <div className="wba-input-group">
            <label className="wba-input-label" htmlFor="qr-sku">Scanned QR / SKU</label>
            <input id="qr-sku" className="wba-input-field" value={code} onChange={(event) => { setCode(event.target.value); setSuggestion(null); setError(''); }} placeholder="e.g. WBA-AC-001" autoComplete="off" />
          </div>
          <div className="wba-input-group">
            <label className="wba-input-label" htmlFor="qr-quantity">Quantity received</label>
            <input id="qr-quantity" className="wba-input-field" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </div>
          {error && <p className="wba-qr-scanner-error" role="alert">{error}</p>}
          {suggestion?.label === code.trim() && <p role="status">Suggested match: {suggestion.product.name} ({suggestion.product.sku}). Verify the physical label before confirming receipt.</p>}
          <div className="wba-qr-scanner-actions">
            <button type="button" className="wba-pill-btn" onClick={() => { stopCamera(); onClose(); }}>Cancel</button>
            <button type="submit" className="wba-btn-primary" disabled={matching}>{matching ? 'Checking label…' : suggestion?.label === code.trim() ? 'Confirm matched product and receive' : 'Add to inventory'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
