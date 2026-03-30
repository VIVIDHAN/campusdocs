import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function MergePDF() {
  const [files,      setFiles]   = useState([]);
  const [previewUrl, setPreview] = useState(null);
  const [merging,    setMerging] = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  useEffect(() => {
    if (files.length === 0) { setPreview(null); return; }
    if (files.length === 1) { setPreview(URL.createObjectURL(files[0])); return; }
    const t = setTimeout(async () => {
      try {
        const out = await PDFDocument.create();
        for (const f of files) {
          const src = await PDFDocument.load(await f.arrayBuffer());
          const pages = await out.copyPages(src, src.getPageIndices());
          pages.forEach(p => out.addPage(p));
        }
        setPreview(URL.createObjectURL(new Blob([await out.save()], { type: 'application/pdf' })));
      } catch (e) { console.error(e); }
    }, 600);
    return () => clearTimeout(t);
  }, [files]);

  const sort = () => {
    const arr = [...files];
    const [m] = arr.splice(dragItem.current, 1);
    arr.splice(dragOver.current, 0, m);
    dragItem.current = null; dragOver.current = null;
    setFiles(arr);
  };

  const download = () => {
    if (!previewUrl || files.length < 2) return;
    setMerging(true);
    const a = document.createElement('a');
    a.href = previewUrl; a.download = 'CampusDocs_Merged.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); setMerging(false); }, 200);
  };

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Merge PDFs</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Upload files, drag to reorder, then download.</p>
        </div>

        <input type="file" multiple accept="application/pdf" id="merge-in" style={{ display: 'none' }}
          onChange={e => setFiles(p => [...p, ...Array.from(e.target.files)])} />
        <label htmlFor="merge-in" className="cd-btn" style={{ background: '#ef4444', color: 'white', cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Add PDFs
        </label>

        {files.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '300px', overflowY: 'auto' }}>
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} draggable
                  onDragStart={() => dragItem.current = i}
                  onDragEnter={() => dragOver.current = i}
                  onDragEnd={sort}
                  onDragOver={e => e.preventDefault()}
                  className="cd-file-chip" style={{ cursor: 'grab' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--muted)', fontSize: '17px', flexShrink: 0 }}>drag_indicator</span>
                  <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '17px', flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}. {f.name}</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>
            <button className="cd-btn" onClick={download} disabled={merging || files.length < 2}
              style={{ background: files.length < 2 ? 'var(--muted)' : '#3b82f6', color: 'white' }}>
              {merging
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Merging...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download Merged PDF</>}
            </button>
          </>
        ) : (
          <div className="cd-empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>upload_file</span>
            Add at least 2 PDFs to merge
          </div>
        )}
      </div>

      {/* RIGHT — PREVIEW */}
      <div className="cd-card cd-panel-right">
        <div className="cd-preview-header">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>preview</span> Live Preview
        </div>
        {previewUrl
          ? <iframe src={`${previewUrl}#toolbar=0`} style={{ flex: 1, border: 'none', width: '100%' }} title="Merge Preview" />
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>picture_as_pdf</span>Upload PDFs to see preview</div>}
      </div>
    </div>
  );
}
