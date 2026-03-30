import { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const hexRgb = h => rgb(parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255);

const POSITIONS = ['bottom-center','bottom-left','bottom-right','top-center','top-left','top-right'];

export default function PageNumbers() {
  const [file,    setFile]   = useState(null);
  const [preview, setPreview]= useState(null);
  const [busy,    setBusy]   = useState(false);
  const [opts, setOpts] = useState({ position: 'bottom-center', startFrom: 1, fontSize: 11, prefix: '', color: '#000000' });

  const buildPdf = async () => {
    const pdf  = await PDFDocument.load(await file.arrayBuffer());
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.getPages().forEach((page, i) => {
      const { width, height } = page.getSize();
      const label = `${opts.prefix}${i + Number(opts.startFrom)}`;
      const tw    = font.widthOfTextAtSize(label, Number(opts.fontSize));
      const pos   = {
        'bottom-center': { x: (width - tw) / 2, y: 18 },
        'bottom-right':  { x: width - tw - 18,  y: 18 },
        'bottom-left':   { x: 18,                y: 18 },
        'top-center':    { x: (width - tw) / 2,  y: height - 26 },
        'top-right':     { x: width - tw - 18,   y: height - 26 },
        'top-left':      { x: 18,                y: height - 26 },
      }[opts.position];
      page.drawText(label, { x: pos.x, y: pos.y, size: Number(opts.fontSize), font, color: hexRgb(opts.color) });
    });
    return pdf.save();
  };

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const t = setTimeout(async () => {
      try { setPreview(URL.createObjectURL(new Blob([await buildPdf()], { type: 'application/pdf' }))); }
      catch (e) { console.error(e); }
    }, 600);
    return () => clearTimeout(t);
  }, [file, opts]);

  const download = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([await buildPdf()], { type: 'application/pdf' }));
      a.download = `Numbered_${file.name}`;
      document.body.appendChild(a); a.click(); setTimeout(() => document.body.removeChild(a), 200);
    } catch (e) { console.error(e); }
    setBusy(false);
  };

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Add Page Numbers</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Stamp page numbers at any position.</p>
        </div>

        <input type="file" accept="application/pdf" id="pn-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />

        {!file ? (
          <label htmlFor="pn-in" className="cd-btn" style={{ background: '#6366f1', color: 'white', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span> Upload PDF
          </label>
        ) : (
          <>
            <div className="cd-file-chip">
              <span className="material-symbols-outlined" style={{ color: '#6366f1', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
              </button>
            </div>

            <div>
              <label className="cd-label">Position</label>
              <select className="cd-input" value={opts.position} onChange={e => setOpts({ ...opts, position: e.target.value })} style={{ cursor: 'pointer' }}>
                {POSITIONS.map(p => <option key={p} value={p}>{p.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="cd-label">Start From</label>
                <input className="cd-input" type="number" min="1" value={opts.startFrom} onChange={e => setOpts({ ...opts, startFrom: e.target.value })} />
              </div>
              <div>
                <label className="cd-label">Font Size</label>
                <input className="cd-input" type="number" min="8" max="24" value={opts.fontSize} onChange={e => setOpts({ ...opts, fontSize: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="cd-label">Prefix (optional)</label>
              <input className="cd-input" value={opts.prefix} onChange={e => setOpts({ ...opts, prefix: e.target.value })} placeholder='e.g. "Page " → Page 1' />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="cd-label" style={{ margin: 0 }}>Color</label>
              <input type="color" value={opts.color} onChange={e => setOpts({ ...opts, color: e.target.value })}
                style={{ width: '38px', height: '30px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '2px', background: 'none' }} />
            </div>

            <button className="cd-btn" onClick={download} disabled={busy}
              style={{ background: busy ? 'var(--muted)' : '#6366f1', color: 'white' }}>
              {busy
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Processing...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download</>}
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
          ? <iframe src={`${preview}#toolbar=0`} style={{ flex: 1, border: 'none', width: '100%' }} title="Page Numbers Preview" />
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>format_list_numbered</span>Upload a PDF to see preview</div>}
      </div>
    </div>
  );
}
