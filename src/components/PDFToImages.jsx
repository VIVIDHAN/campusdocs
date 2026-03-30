import { useState } from 'react';

const loadPdfJs = () => new Promise((resolve, reject) => {
  if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    resolve(window.pdfjsLib);
  };
  s.onerror = reject;
  document.head.appendChild(s);
});

export default function PDFToImages() {
  const [file,     setFile]    = useState(null);
  const [images,   setImages]  = useState([]);
  const [progress, setProgress]= useState(0);
  const [busy,     setBusy]    = useState(false);

  const convert = async () => {
    if (!file) return;
    setBusy(true); setImages([]); setProgress(0);
    try {
      const lib = await loadPdfJs();
      const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      const out = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        out.push({ url: canvas.toDataURL('image/jpeg', 0.92), name: `page_${i}.jpg` });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setImages(out);
    } catch (e) { console.error(e); alert('Failed to convert PDF.'); }
    setBusy(false);
  };

  const downloadAll = () => {
    images.forEach((img, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.url; a.download = img.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }, i * 250);
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="cd-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>PDF → Images</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>Convert every page into a high-quality JPG.</p>
        </div>

        <input type="file" accept="application/pdf" id="pti-in" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setImages([]); } }} />

        {!file ? (
          <label htmlFor="pti-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '44px 20px', border: '2px dashed var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#ec4899'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <span className="material-symbols-outlined" style={{ fontSize: '44px', color: '#ec4899', fontVariationSettings: "'FILL' 1" }}>image_search</span>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Click to upload PDF</span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Each page becomes a separate JPG</span>
          </label>
        ) : (
          <div className="cd-file-chip">
            <span className="material-symbols-outlined" style={{ color: '#ec4899', fontSize: '20px', fontVariationSettings: "'FILL' 1", flexShrink: 0 }}>picture_as_pdf</span>
            <span style={{ flex: 1, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
            <button onClick={() => { setFile(null); setImages([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
            </button>
          </div>
        )}

        {/* Progress */}
        {busy && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600' }}>Converting pages...</span>
              <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '700' }}>{progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#ec4899,#f43f5e)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {file && images.length === 0 && !busy && (
          <button className="cd-btn" onClick={convert} style={{ background: '#ec4899', color: 'white' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>image_search</span> Convert to Images
          </button>
        )}
      </div>

      {/* Results grid */}
      {images.length > 0 && (
        <div className="cd-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '700' }}>{images.length} page{images.length > 1 ? 's' : ''} converted</span>
            <button onClick={downloadAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span> Download All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <img src={img.url} alt={`Page ${i+1}`} style={{ width: '100%', display: 'block' }} />
                <div style={{ padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>Page {i+1}</span>
                  <a href={img.url} download={img.name} style={{ color: '#ec4899', display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
