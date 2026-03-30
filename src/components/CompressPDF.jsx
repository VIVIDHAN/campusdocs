import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const fmt = b => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

export default function CompressPDF() {
  const [file,   setFile]   = useState(null);
  const [result, setResult] = useState(null);
  const [busy,   setBusy]   = useState(false);

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pdf  = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const bytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
      setResult({ url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), orig: file.size, compressed: bytes.byteLength });
    } catch (e) { console.error(e); alert('Could not process this PDF.'); }
    setBusy(false);
  };

  const saved = result ? Math.max(0, Math.round((1 - result.compressed / result.orig) * 100)) : 0;

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto' }}>
      <div className="cd-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Compress PDF</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Reduce file size to beat restrictive upload limits.</p>
        </div>

        <input type="file" accept="application/pdf" id="cmp-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setResult(null); } }} />

        {!file ? (
          <label htmlFor="cmp-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '44px 20px', border: '2px dashed var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#06b6d4', fontVariationSettings: "'FILL' 1" }}>compress</span>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Click to upload PDF</span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>or drag and drop</span>
          </label>
        ) : (
          <div className="cd-file-chip">
            <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResult(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
            </button>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div style={{ padding: '20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              {[{ label: 'Original', val: fmt(result.orig), color: 'var(--text)' }, { label: 'Compressed', val: fmt(result.compressed), color: '#10b981' }].map((s, i) => (
                <div key={i}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)' }}>{s.label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '800', color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '4px 14px', borderRadius: '20px' }}>
                {saved > 0 ? `${saved}% smaller` : 'Already optimized — no further reduction possible'}
              </span>
            </div>
            <a href={result.url} download={`Compressed_${file.name}`} className="cd-btn" style={{ background: '#06b6d4', color: 'white', textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download Compressed PDF
            </a>
          </div>
        )}

        {file && !result && (
          <button className="cd-btn" onClick={compress} disabled={busy}
            style={{ background: busy ? 'var(--muted)' : '#06b6d4', color: 'white' }}>
            {busy
              ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Compressing...</>
              : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>compress</span> Compress PDF</>}
          </button>
        )}
      </div>
    </div>
  );
}
