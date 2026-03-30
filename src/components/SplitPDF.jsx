import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPDF() {
  const [file,       setFile]   = useState(null);
  const [start,      setStart]  = useState('');
  const [end,        setEnd]    = useState('');
  const [total,      setTotal]  = useState(null);
  const [previewUrl, setPreview]= useState(null);
  const [busy,       setBusy]   = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); setTotal(null); return; }
    const t = setTimeout(async () => {
      try {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const n   = pdf.getPageCount();
        setTotal(n);
        const s = parseInt(start) - 1, e = parseInt(end) - 1;
        if (start && end && s >= 0 && e < n && s <= e) {
          const out = await PDFDocument.create();
          const idx = Array.from({ length: e - s + 1 }, (_, i) => s + i);
          (await out.copyPages(pdf, idx)).forEach(p => out.addPage(p));
          setPreview(URL.createObjectURL(new Blob([await out.save()], { type: 'application/pdf' })));
        } else {
          setPreview(URL.createObjectURL(file));
        }
      } catch (err) { console.error(err); }
    }, 500);
    return () => clearTimeout(t);
  }, [file, start, end]);

  const download = () => {
    if (!previewUrl) return;
    setBusy(true);
    const a = document.createElement('a');
    a.href = previewUrl; a.download = `CampusDocs_Split_p${start}-${end}.pdf`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); setBusy(false); }, 200);
  };

  const pageCount = start && end ? Math.max(0, parseInt(end) - parseInt(start) + 1) : 0;

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Split PDF</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Extract a page range from any PDF.</p>
        </div>

        <input type="file" accept="application/pdf" id="split-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setStart(''); setEnd(''); } }} />

        {!file ? (
          <label htmlFor="split-in" className="cd-btn" style={{ background: '#10b981', color: 'white', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span> Upload PDF
          </label>
        ) : (
          <>
            <div className="cd-file-chip">
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                {total && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>{total} pages total</p>}
              </div>
              <button onClick={() => { setFile(null); setStart(''); setEnd(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ label: 'Start Page', val: start, set: setStart }, { label: 'End Page', val: end, set: setEnd }].map(f => (
                <div key={f.label}>
                  <label className="cd-label">{f.label}</label>
                  <input className="cd-input" type="number" min="1" max={total || ''} inputMode="numeric" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.label === 'End Page' ? (total || '?') : '1'} style={{ colorScheme: 'dark' }} />
                </div>
              ))}
            </div>

            {pageCount > 0 && (
              <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                Extracting {pageCount} page{pageCount > 1 ? 's' : ''} from {total}
              </div>
            )}

            <button className="cd-btn" onClick={download} disabled={busy || !start || !end}
              style={{ background: (!start || !end) ? 'var(--muted)' : '#10b981', color: 'white' }}>
              {busy
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Processing...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download Split PDF</>}
            </button>
          </>
        )}
      </div>

      {/* RIGHT — PREVIEW */}
      <div className="cd-card cd-panel-right">
        <div className="cd-preview-header" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>preview</span> Live Preview</span>
          {start && end && <span style={{ color: '#10b981' }}>Pages {start}–{end}</span>}
        </div>
        {previewUrl
          ? <iframe src={`${previewUrl}#toolbar=0`} style={{ flex: 1, border: 'none', width: '100%' }} title="Split Preview" />
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>picture_as_pdf</span>Upload a PDF to see preview</div>}
      </div>
    </div>
  );
}
