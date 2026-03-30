import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

export default function OCRTool() {
  const [image,    setImage]    = useState(null);   // { url, file }
  const [text,     setText]     = useState('');
  const [progress, setProgress] = useState(0);
  const [status,   setStatus]   = useState('');     // idle | scanning | done | error
  const [copied,   setCopied]   = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage({ url: URL.createObjectURL(file), file });
    setText(''); setStatus('idle'); setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!image) return;
    setStatus('scanning'); setText(''); setProgress(0);

    try {
      const result = await Tesseract.recognize(image.url, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(result.data.text.trim());
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const reset = () => {
    setImage(null); setText(''); setStatus('idle'); setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Upload zone */}
      {!image ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="cd-card"
          style={{ padding: '60px 20px', textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <span className="material-symbols-outlined" style={{ fontSize: '52px', color: '#8b5cf6', display: 'block', marginBottom: '14px', fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
          <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Drop an image here or click to upload</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Supports JPG, PNG, WEBP — textbook pages, whiteboards, handwritten notes</p>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Left: image + controls */}
          <div className="cd-card cd-panel-left" style={{ padding: '20px', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Source Image</h3>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Change
              </button>
            </div>

            <img src={image.url} alt="Source" style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border)', objectFit: 'contain', maxHeight: '320px' }} />

            {/* Progress bar */}
            {status === 'scanning' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600' }}>Scanning with Tesseract OCR...</span>
                  <span style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: '700' }}>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            <button className="cd-btn" onClick={handleScan} disabled={status === 'scanning'}
              style={{ background: status === 'scanning' ? 'var(--muted)' : '#8b5cf6', color: 'white' }}>
              {status === 'scanning'
                ? <><div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Scanning...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>document_scanner</span> {status === 'done' ? 'Re-scan' : 'Extract Text'}</>}
            </button>
          </div>

          {/* Right: output */}
          <div className="cd-card cd-panel-right" style={{ padding: '20px', gap: '14px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Extracted Text</h3>
              {text && (
                <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: copied ? '#dcfce7' : 'var(--surface2)', border: `1px solid ${copied ? '#bbf7d0' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: copied ? '#16a34a' : 'var(--text)', transition: 'all 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{copied ? 'check' : 'content_copy'}</span>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {status === 'idle' && (
              <div className="cd-empty-state" style={{ flex: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.3 }}>text_fields</span>
                <p style={{ margin: 0 }}>Hit "Extract Text" to scan the image</p>
              </div>
            )}

            {status === 'scanning' && (
              <div className="cd-empty-state" style={{ flex: 1 }}>
                <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: '#8b5cf6', borderRadius: '50%' }} />
                <p style={{ margin: 0, color: '#8b5cf6', fontWeight: '600' }}>Analysing image...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="cd-empty-state" style={{ flex: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#ef4444' }}>error</span>
                <p style={{ margin: 0, color: '#ef4444', fontWeight: '600' }}>Scan failed. Try a clearer image.</p>
              </div>
            )}

            {status === 'done' && (
              <>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ flex: 1, minHeight: '300px', padding: '14px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                />
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                  {text.split(/\s+/).filter(Boolean).length} words · {text.length} characters · You can edit before copying.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
