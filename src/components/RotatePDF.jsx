import { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePDF() {
  const [file,    setFile]   = useState(null);
  const [total,   setTotal]  = useState(0);
  const [rots,    setRots]   = useState([]);   // per-page rotation offset
  const [preview, setPreview]= useState(null);
  const [busy,    setBusy]   = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); setTotal(0); setRots([]); return; }
    (async () => {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const n   = pdf.getPageCount();
      setTotal(n); setRots(new Array(n).fill(0));
      setPreview(URL.createObjectURL(file));
    })();
  }, [file]);

  const rotateAll = (angle) => setRots(new Array(total).fill(angle));

  const rotatePage = (i, delta) => {
    const next = [...rots];
    next[i] = ((next[i] + delta) % 360 + 360) % 360;
    setRots(next);
  };

  const download = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      pdf.getPages().forEach((p, i) => {
        const cur = p.getRotation().angle;
        p.setRotation(degrees((cur + (rots[i] || 0)) % 360));
      });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await pdf.save()], { type: 'application/pdf' }));
      a.download = `Rotated_${file.name}`;
      document.body.appendChild(a); a.click(); setTimeout(() => document.body.removeChild(a), 200);
    } catch (e) { console.error(e); }
    setBusy(false);
  };

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Rotate PDF</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Fix sideways scans — rotate all or individual pages.</p>
        </div>

        <input type="file" accept="application/pdf" id="rot-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />

        {!file ? (
          <label htmlFor="rot-in" className="cd-btn" style={{ background: '#f97316', color: 'white', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span> Upload PDF
          </label>
        ) : (
          <>
            <div className="cd-file-chip">
              <span className="material-symbols-outlined" style={{ color: '#f97316', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
              </button>
            </div>

            {/* Global rotate */}
            <div style={{ padding: '14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700' }}>Rotate All Pages</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[90, 180, 270].map(a => (
                  <button key={a} onClick={() => rotateAll(a)}
                    style={{ flex: 1, padding: '9px 6px', background: rots.length && rots.every(r => r === a) ? '#f97316' : 'var(--surface)', color: rots.length && rots.every(r => r === a) ? 'white' : 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: 'all 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>rotate_right</span> {a}°
                  </button>
                ))}
              </div>
            </div>

            {/* Per-page (only show for small PDFs) */}
            {total > 0 && total <= 20 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700' }}>Per-Page Control</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {Array.from({ length: total }, (_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>Page {i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#f97316', fontWeight: '700', minWidth: '30px', textAlign: 'center' }}>{rots[i] || 0}°</span>
                        {[{ icon: 'rotate_left', d: -90 }, { icon: 'rotate_right', d: 90 }].map(b => (
                          <button key={b.d} onClick={() => rotatePage(i, b.d)} style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{b.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="cd-btn" onClick={download} disabled={busy}
              style={{ background: busy ? 'var(--muted)' : '#f97316', color: 'white' }}>
              {busy
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Processing...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download Rotated PDF</>}
            </button>
          </>
        )}
      </div>

      {/* RIGHT — PREVIEW */}
      <div className="cd-card cd-panel-right">
        <div className="cd-preview-header">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>preview</span> Original Preview
        </div>
        {preview
          ? <iframe src={`${preview}#toolbar=0`} style={{ flex: 1, border: 'none', width: '100%' }} title="Rotate Preview" />
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>rotate_right</span>Upload a PDF to get started</div>}
      </div>
    </div>
  );
}
