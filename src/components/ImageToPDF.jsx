import { useState, useRef } from 'react';
import jsPDF from 'jspdf';

export default function ImageToPDF() {
  const [images,  setImages]  = useState([]);
  const [selIdx,  setSelIdx]  = useState(0);
  const [busy,    setBusy]    = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const addFiles = (e) => {
    const newImgs = Array.from(e.target.files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setImages(p => [...p, ...newImgs]);
  };

  const sort = () => {
    const arr = [...images];
    const [m] = arr.splice(dragItem.current, 1);
    arr.splice(dragOver.current, 0, m);
    dragItem.current = null; dragOver.current = null;
    setImages(arr);
  };

  const download = async () => {
    if (!images.length) return;
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const W = 210, H = 297, M = 10;
      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();
        const img = new Image();
        img.src = images[i].url;
        await new Promise(res => { img.onload = res; });
        const ratio = Math.min((W - M * 2) / img.width, (H - M * 2) / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        doc.addImage(img, 'JPEG', (W - w) / 2, (H - h) / 2, w, h);
      }
      doc.save('CampusDocs_Images.pdf');
    } catch (err) { console.error(err); }
    setBusy(false);
  };

  return (
    <div className="cd-tool-wrap">
      {/* LEFT */}
      <div className="cd-card cd-panel-left" style={{ padding: '24px', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>JPG / PNG → PDF</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Convert images into one PDF. Drag to reorder.</p>
        </div>

        <input type="file" multiple accept="image/*" id="img-in" style={{ display: 'none' }} onChange={addFiles} />
        <label htmlFor="img-in" className="cd-btn" style={{ background: '#f59e0b', color: 'white', cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_photo_alternate</span> Add Images
        </label>

        {images.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '300px', overflowY: 'auto' }}>
              {images.map((img, i) => (
                <div key={`${img.file.name}-${i}`} draggable
                  onDragStart={() => { dragItem.current = i; setSelIdx(i); }}
                  onDragEnter={() => dragOver.current = i}
                  onDragEnd={sort}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => setSelIdx(i)}
                  className="cd-file-chip"
                  style={{ cursor: 'pointer', borderColor: selIdx === i ? '#f59e0b' : 'var(--border)', background: selIdx === i ? 'rgba(245,158,11,0.06)' : 'var(--surface2)', transition: 'all 0.15s' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--muted)', fontSize: '17px', flexShrink: 0 }}>drag_indicator</span>
                  <img src={img.url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}. {img.file.name}</span>
                  <button onClick={e => { e.stopPropagation(); const n = images.filter((_,j)=>j!==i); setImages(n); if(selIdx>=n.length) setSelIdx(Math.max(0,n.length-1)); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>
            <button className="cd-btn" onClick={download} disabled={busy}
              style={{ background: busy ? 'var(--muted)' : '#f59e0b', color: 'white' }}>
              {busy
                ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Converting...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '19px' }}>download</span> Download PDF ({images.length} page{images.length > 1 ? 's' : ''})</>}
            </button>
          </>
        ) : (
          <div className="cd-empty-state">
            <span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>image</span>
            Add images to get started
          </div>
        )}
      </div>

      {/* RIGHT — PREVIEW */}
      <div className="cd-card cd-panel-right">
        <div className="cd-preview-header" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>preview</span> Preview</span>
          {images.length > 0 && <span style={{ color: '#f59e0b' }}>Image {selIdx + 1} of {images.length}</span>}
        </div>
        {images.length > 0
          ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--surface2)' }}>
              <img src={images[selIdx]?.url} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }} />
            </div>
          : <div className="cd-empty-state"><span className="material-symbols-outlined" style={{ fontSize: '38px', opacity: 0.3 }}>image</span>Add images to see preview</div>}
      </div>
    </div>
  );
}
