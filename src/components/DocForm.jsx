import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import { logGeneration } from '../services/sheetsService';

const DOC_TYPES = ['Medical Leave Letter', 'One Day Leave Letter', 'On Duty (OD) Letter'];

function buildLetter(d) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const dept  = d.className ? `Department of ${d.className}` : 'The Department';

  const bodies = {
    'Medical Leave Letter':
      `I am writing to formally inform you that I am unable to attend classes from ${d.fromDate} to ${d.toDate} due to medical reasons. ${d.reason}.\n\nI have been advised by my doctor to rest during this period and will submit the medical certificate upon my return. I kindly request you to grant me leave for the mentioned days.`,
    'One Day Leave Letter':
      `I am writing to request a leave of absence for one day on ${d.fromDate}. The reason for my absence is: ${d.reason}.\n\nI assure you that I will complete any missed work promptly. I kindly request you to grant me permission for this leave.`,
    'On Duty (OD) Letter':
      `I am writing to formally request On Duty (OD) leave from ${d.fromDate} to ${d.toDate}. I will be representing the institution at ${d.reason}.\n\nI kindly request you to approve my OD leave for the aforementioned dates.`,
  };

  const subjects = {
    'Medical Leave Letter': 'Application for Medical Leave',
    'One Day Leave Letter': 'Application for One Day Leave',
    'On Duty (OD) Letter':  'Request for On Duty (OD) Leave',
  };

  return [
    `Date: ${today}`,
    ``,
    `To,`,
    `The Head of Department,`,
    dept,
    ``,
    `Subject: ${subjects[d.docType]}`,
    ``,
    `Respected Sir/Madam,`,
    ``,
    bodies[d.docType],
    ``,
    `Thank you for your understanding and consideration.`,
    ``,
    `Yours obediently,`,
    ``,
    ``,
    ``,
    d.name,
    `Roll No: ${d.rollNo}`,
    d.className ? `Class / Dept: ${d.className}` : null,
    d.phone     ? `Phone: ${d.phone}`             : null,
  ].filter(l => l !== null).join('\n');
}

export default function DocForm({ user, isDark }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('cd_autofill')) || {}; } catch { return {}; } })();

  const [form, setForm] = useState({
    docType:   DOC_TYPES[0],
    name:      saved.name      || user?.name || '',
    rollNo:    saved.rollNo    || '',
    className: saved.className || '',
    phone:     saved.phone     || '',
    fromDate:  '',
    toDate:    '',
    reason:    '',
  });

  const [output,     setOutput]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [done,       setDone]       = useState(false);

  // ✍️ Signature ref — initialised as null, assigned via callback ref
  const sigRef = useRef(null);

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    localStorage.setItem('cd_autofill', JSON.stringify({
      name: next.name, rollNo: next.rollNo, className: next.className, phone: next.phone,
    }));
  };

  const handleGenerate = () => {
    if (!form.name || !form.rollNo || !form.fromDate || !form.toDate || !form.reason) {
      alert('Please fill in all required fields (*)'); return;
    }
    setLoading(true);
    setTimeout(() => {
      setOutput(buildLetter(form));
      setLoading(false);
      setDone(false);
    }, 400);
  };

  // ── THE FIX: build PDF entirely from the `output` string, never rely on a URL ──
  const handleDownload = () => {
    if (!output) return;
    setDownloading(true);

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFont('times', 'normal');
      doc.setFontSize(12);

      const margin  = 22;
      const maxW    = 166; // 210 - 2*22
      let   y       = 28;
      const lineH   = 6.5;

      output.split('\n').forEach(line => {
        // New page if we're running out of space
        if (y > 270) { doc.addPage(); y = 28; }

        if (line.trim() === '') {
          y += lineH * 0.7;
        } else {
          const wrapped = doc.splitTextToSize(line, maxW);
          doc.text(wrapped, margin, y);
          y += wrapped.length * lineH;
        }
      });

      // ✍️ Embed signature if drawn — safe null check
      if (sigRef.current && typeof sigRef.current.isEmpty === 'function' && !sigRef.current.isEmpty()) {
        const sigData = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
        // Place signature above the name block (y is now past the name lines)
        const sigY = Math.min(y - 22, 265);
        doc.addImage(sigData, 'PNG', margin, sigY, 48, 16);
      }

      const fileName = `CampusDocs_${form.docType.replace(/[\s()]/g, '_')}.pdf`;
      doc.save(fileName);

      // Log to Google Sheets (fire-and-forget)
      logGeneration({ tool: 'generator', docType: form.docType, name: form.name, rollNo: form.rollNo });

      setDone(true);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Something went wrong generating the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="cd-card anim-pop" style={{ padding: '28px', maxWidth: '760px', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>Generate Letter</h2>
        <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '14px' }}>Smart Memory saves your details automatically.</p>

        {/* Doc type */}
        <div style={{ marginBottom: '18px' }}>
          <label className="cd-label">Document Type</label>
          <select className="cd-input" name="docType" value={form.docType} onChange={onChange} style={{ cursor: 'pointer', colorScheme: isDark ? 'dark' : 'light' }}>
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          {[
            { name: 'name',      label: 'Student Name *',  type: 'text', ph: 'Full name'        },
            { name: 'rollNo',    label: 'Roll Number *',   type: 'text', ph: 'e.g. 21CS045'     },
            { name: 'className', label: 'Class / Dept',    type: 'text', ph: 'e.g. CSE-B'       },
            { name: 'phone',     label: 'Phone Number',    type: 'tel',  ph: '10-digit number'  },
            { name: 'fromDate',  label: 'From Date *',     type: 'date', ph: ''                 },
            { name: 'toDate',    label: 'To Date *',       type: 'date', ph: ''                 },
          ].map(f => (
            <div key={f.name}>
              <label className="cd-label">{f.label}</label>
              <input className="cd-input" name={f.name} type={f.type} value={form[f.name]} onChange={onChange} placeholder={f.ph} style={{ colorScheme: isDark ? 'dark' : 'light' }} />
            </div>
          ))}
        </div>

        {/* Reason */}
        <div style={{ marginBottom: '22px' }}>
          <label className="cd-label">Reason / Details *</label>
          <textarea className="cd-input" name="reason" value={form.reason} onChange={onChange} placeholder="Describe the reason in detail..." rows={3} style={{ resize: 'vertical', lineHeight: 1.6 }} />
        </div>

        {/* Signature */}
        <div style={{ marginBottom: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="cd-label" style={{ margin: 0 }}>Digital Signature <span style={{ textTransform: 'none', fontWeight: '400', color: 'var(--muted)' }}>(optional)</span></label>
            <button onClick={() => sigRef.current?.clear()} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Clear</button>
          </div>
          <div style={{ border: '1.5px dashed var(--border)', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc' }}>
            <SignatureCanvas
              ref={r => { sigRef.current = r; }}
              penColor="#1e293b"
              canvasProps={{ style: { width: '100%', height: '120px', display: 'block' } }}
            />
          </div>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--muted)' }}>Sign with mouse or finger — embedded in the PDF.</p>
        </div>

        <button className="cd-btn" onClick={handleGenerate} disabled={loading}
          style={{ background: loading ? 'var(--muted)' : '#3b82f6', color: 'white' }}>
          {loading
            ? <><div className="spinner" style={{ width: '17px', height: '17px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Generating...</>
            : <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span> Generate Document</>}
        </button>
      </div>

      {/* ── PREVIEW MODAL ── */}
      {output && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="anim-pop" style={{ background: '#ffffff', width: '100%', maxWidth: '720px', maxHeight: '92vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>

            {done ? (
              /* Success screen */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#16a34a', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '22px', fontWeight: '800' }}>PDF Downloaded!</h2>
                <p style={{ color: '#64748b', margin: '0 0 32px', fontSize: '14px' }}>Check your downloads folder.</p>
                <button onClick={() => { setOutput(''); setDone(false); }} style={{ padding: '13px 28px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                  Create Another
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '700' }}>Preview</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>{form.docType}</p>
                  </div>
                  <button onClick={() => setOutput('')} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>close</span>
                  </button>
                </div>

                {/* Letter body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f1f5f9' }}>
                  <div style={{ background: 'white', padding: '44px 48px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontFamily: '"Times New Roman", Times, serif', fontSize: '15px', color: '#000', lineHeight: 1.85, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', maxWidth: '640px', margin: '0 auto' }}>
                    {output}
                  </div>
                </div>

                {/* Footer actions */}
                <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', background: 'white' }}>
                  <button onClick={() => setOutput('')} style={{ flex: 1, padding: '13px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={handleDownload} disabled={downloading}
                    style={{ flex: 2, padding: '13px', background: downloading ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {downloading
                      ? <><div className="spinner" style={{ width: '15px', height: '15px', border: '2px solid #ffffff40', borderTopColor: 'white', borderRadius: '50%' }} /> Generating PDF...</>
                      : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Download PDF</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
