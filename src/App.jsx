import { useState, useEffect } from 'react';
import Login from './pages/Login';
import DocForm from './components/DocForm';
import MergePDF from './components/MergePDF';
import SplitPDF from './components/SplitPDF';
import ImageToPDF from './components/ImageToPDF';
import WatermarkPDF from './components/WatermarkPDF';
import RotatePDF from './components/RotatePDF';
import CompressPDF from './components/CompressPDF';
import PageNumbers from './components/PageNumbers';
import PDFToImages from './components/PDFToImages';
import OCRTool from './components/OCRTool';

const TOOLS = [
  { id: 'generator', label: 'Generate Letter',   desc: 'Create leave & OD letters instantly.',         icon: 'edit_document',        color: '#3b82f6', cat: 'Create'   },
  { id: 'merge',     label: 'Merge PDF',          desc: 'Combine multiple PDFs with drag-and-drop.',    icon: 'call_merge',           color: '#ef4444', cat: 'Organize' },
  { id: 'split',     label: 'Split PDF',           desc: 'Extract a page range from any PDF.',           icon: 'call_split',           color: '#10b981', cat: 'Organize' },
  { id: 'rotate',    label: 'Rotate PDF',          desc: 'Fix sideways scans — rotate any page.',        icon: 'rotate_right',         color: '#f97316', cat: 'Organize' },
  { id: 'convert',   label: 'JPG → PDF',           desc: 'Turn assignment photos into one PDF.',         icon: 'image',                color: '#f59e0b', cat: 'Convert'  },
  { id: 'pdftoimg',  label: 'PDF → Images',        desc: 'Export every page as a JPG image.',            icon: 'image_search',         color: '#ec4899', cat: 'Convert'  },
  { id: 'ocr',       label: 'Image → Text (OCR)',  desc: 'Extract text from photos & scans with AI.',    icon: 'document_scanner',     color: '#8b5cf6', cat: 'Convert'  },
  { id: 'watermark', label: 'Add Watermark',       desc: 'Stamp custom text diagonally on every page.',  icon: 'branding_watermark',   color: '#a855f7', cat: 'Edit'     },
  { id: 'pagenums',  label: 'Page Numbers',        desc: 'Add page numbers at any position.',            icon: 'format_list_numbered', color: '#6366f1', cat: 'Edit'     },
  { id: 'compress',  label: 'Compress PDF',        desc: 'Shrink file size to beat upload limits.',      icon: 'compress',             color: '#06b6d4', cat: 'Optimize' },
];

const CATS = ['All', 'Create', 'Organize', 'Convert', 'Edit', 'Optimize'];

export default function App() {
  const [user, setUser]           = useState(() => { try { return JSON.parse(localStorage.getItem('cd_user')); } catch { return null; } });
  const [activeTool, setActive]   = useState(null);
  const [isDark, setDark]         = useState(() => localStorage.getItem('cd_theme') !== 'light');
  const [cat, setCat]             = useState('All');
  const [mobileMenu, setMobMenu]  = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('cd_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const login  = (u) => { setUser(u); localStorage.setItem('cd_user', JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem('cd_user'); setActive(null); setMobMenu(false); };

  if (!user) return <Login onLogin={login} isDark={isDark} />;

  const meta     = TOOLS.find(t => t.id === activeTool);
  const filtered = cat === 'All' ? TOOLS : TOOLS.filter(t => t.cat === cat);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── NAV ── */}
      <nav className="no-print" style={{ position: 'sticky', top: 0, zIndex: 200, height: 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <button onClick={() => { setActive(null); setMobMenu(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
          <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '26px', fontVariationSettings: "'FILL' 1" }}>school</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>CampusDocs</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme toggle */}
          <button onClick={() => setDark(d => !d)} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', color: 'var(--text)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* Desktop: avatar + name + signout */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '800' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
          </div>
          <button className="hide-mobile" onClick={logout} style={{ padding: '7px 14px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMobMenu(m => !m)} style={{ display: 'none', width: '34px', height: '34px', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text)' }}
            className="mob-menu-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{mobileMenu ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenu && (
        <div style={{ position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 150, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '15px', fontWeight: '800' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={logout} style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
            Sign out
          </button>
        </div>
      )}

      {/* ── TOOL VIEW ── */}
      {activeTool ? (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 16px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => setActive(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = meta?.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              <span className="hide-mobile">All Tools</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: (meta?.color || '#ef4444') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: meta?.color, fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{meta?.icon}</span>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{meta?.label}</h1>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{meta?.desc}</p>
              </div>
            </div>
          </div>

          <div className="anim-fade">
            {activeTool === 'generator' && <DocForm user={user} isDark={isDark} />}
            {activeTool === 'merge'     && <MergePDF />}
            {activeTool === 'split'     && <SplitPDF />}
            {activeTool === 'rotate'    && <RotatePDF />}
            {activeTool === 'convert'   && <ImageToPDF />}
            {activeTool === 'pdftoimg'  && <PDFToImages />}
            {activeTool === 'ocr'       && <OCRTool />}
            {activeTool === 'watermark' && <WatermarkPDF />}
            {activeTool === 'pagenums'  && <PageNumbers />}
            {activeTool === 'compress'  && <CompressPDF />}
          </div>
        </div>
      ) : (
        /* ── DASHBOARD ── */
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 80px' }}>

          {/* Hero */}
          <div className="anim-fade" style={{ textAlign: 'center', padding: '52px 16px 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', marginBottom: '20px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>100% Free · Runs entirely in your browser</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.2rem)', fontWeight: '900', margin: '0 0 14px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              Every PDF tool<br />you need.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', margin: 0, maxWidth: '440px', marginInline: 'auto', lineHeight: 1.65 }}>
              Generate letters, merge, split, rotate, convert, OCR and more — zero uploads, zero cost.
            </p>
          </div>

          {/* Category pills */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
            {CATS.map((c, i) => (
              <button key={c} className="anim-fade" onClick={() => setCat(c)}
                style={{ animationDelay: `${i * 0.04}s`, padding: '7px 16px', borderRadius: '20px', border: `1px solid ${cat === c ? '#ef4444' : 'var(--border)'}`, background: cat === c ? '#ef4444' : 'var(--surface)', color: cat === c ? 'white' : 'var(--muted)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Tool grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {filtered.map((tool, i) => <ToolCard key={tool.id} tool={tool} i={i} onClick={() => setActive(tool.id)} />)}
          </div>

          <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px', color: 'var(--muted)' }}>
            All processing happens locally in your browser. No files are ever uploaded to any server.
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .mob-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function ToolCard({ tool, i, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="anim-fade cd-card"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        animationDelay: `${i * 0.045}s`,
        padding: '22px 18px',
        cursor: 'pointer',
        borderColor: hov ? tool.color + '55' : 'var(--border)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? `0 12px 32px ${tool.color}18` : 'var(--shadow)',
        transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}>
      <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: tool.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', transition: 'transform 0.22s', transform: hov ? 'scale(1.1)' : 'scale(1)' }}>
        <span className="material-symbols-outlined" style={{ color: tool.color, fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{tool.icon}</span>
      </div>
      <h3 style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>{tool.label}</h3>
      <p className="hide-mobile" style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{tool.desc}</p>
    </div>
  );
}
