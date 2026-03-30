import { useState, useEffect } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

const hexRgb = h => rgb(parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255);

export default function WatermarkPDF() {
  const [file,    setFile]   = useState(null);
  const [preview, setPreview]= useState(null);
  const [busy,    setBusy]   = useState(false);
  const [wm, setWm] = useState({ text: 'CONFIDENTIAL', opacity: 0.3, size: 60, rotation: 45, color: '#ef4444' });

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const t = setTimeout(async () => {
      try {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        pdf.getPages().forEach(page => {
          const { width, height } = page.getSize();
          const tw = wm.text.length * (wm.size / 2.2);
          page.drawText(wm.text, {
            x: width / 2 - tw / 2, y: height / 2,
            size: Number(wm.size), color: hexRgb(wm.color),
            opacity: Number(wm.opacity), rotate: degrees(Number(wm.rotation)),
          });
        });
        setPreview(URL.createObjectURL(new Blob([await pdf.save()], { type: 'application/pdf' })));
      } catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(t);
  }, [file, wm]);

  const download = () => {
    if (!preview) return;
    setBusy(true);
    const a = document.createElement('a');
    a.href = preview; a.download = `Watermarked_${file.name}`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); setBusy(false); }, 200);
  };

  const sliders = [
    { key: 'opacity',  label: 'Opacity',   min: 0.05, max: 1,   step: 0.05, fmt: v => `${Math.round(v*100)}%` },
    { key: 'size',     label: 'Font Size',  min: 20,   max: 150, step: 5,    fmt: v => `${v}px`                },
    { key: 'rotation', label: 'Rotation',   min: 0,    max: 360, step: 15,   fmt: v => `${v}°`                 },
  ];

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Add Watermark</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Stamp custom text diagonally on every page.</p>
        </div>

        <input type="file" accept="application/pdf" id="wm-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />

        {!file ? (
          <label htmlFor="wm-in" className="cd-btn" style={{ background: '#a855f7', color: 'white', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span> Upload PDF
          </label>
        ) : (
          <>
            <div className="cd-file-chip">
              <span className="material-symbols-outlined" style={{ color: '#a855f7', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
              </button>
            </div>

            <div>
              <label className="cd-label">Watermark Text</label>
              <input className="cd-input" value={wm.text} onChange={e => setWm({ ...wm, text: e.target.value })} placeholder="e.g. CONFIDENTIAL" />
            </div>

            {sliders.map(s => (
              <div key={s.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="cd-label" style={{ margin: 0 }}>{s.label}</label>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#a855f7' }}>{s.fmt(wm[s.key])}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={wm[s.key]}
                  onChange={e => setWm({ ...wm, [s.key]: e.target.value })}
                  style={{ width: '100%', accentColor: '#a855f7' }} />
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="cd-label" style={{ margin: 0 }}>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>{wm.color.toUpperCase()}</span>
                <input type="color" value={wm.color} onChange={e => setWm({ ...wm, color: e.target.value })}
                  style={{ width: '38px', height: '30px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'none' }} />
              </div>
            </div>

            <button className="cd-btn" onClick={download} disabled={busy}
              style={{ background: busy ? 'var(--muted)' : '#a855f7', color: 'white' }}>
              {busy
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Processing...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download Watermarked PDF</>}
            </button>
          </>
        )}
      </div>

      {/* RIGHT — PREVIEW */}
      <div className="cd-card cd-panel-right">
        <div className="cd-preview-header">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>preview</span> Live Preview
        </div>
        {preview
          ? <iframe src={`${preview}#toolbar=0`} style={{ flex: 1, border: 'none', width: '100%' }} title="Watermark Preview" />
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>branding_watermark</span>Upload a PDF to see preview</div>}
      </div>
    </div>
  );
}
