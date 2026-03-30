import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

const CLIENT_ID = '816086429548-sae3b2kpbk5dte0s5k4lmhkno1j5omp5.apps.googleusercontent.com';

export default function Login({ onLogin, isDark }) {
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(false);

  const onSuccess = (res) => {
    setLoading(true);
    try {
      const d = jwtDecode(res.credential);
      setStatus(`Welcome, ${d.name}`);
      setTimeout(() => onLogin({ name: d.name, email: d.email }), 700);
    } catch {
      setStatus('Login error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="cd-card anim-pop" style={{ width: '100%', maxWidth: '400px', padding: '48px 36px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>

          {/* Logo */}
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 8px 24px rgba(239,68,68,0.3)' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>CampusDocs</h1>
          <p style={{ margin: '0 0 32px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Your all-in-one PDF toolkit for students.<br />100% free. Runs in your browser.
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%' }} />
              <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>{status}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={onSuccess}
                onError={() => setStatus('Login failed. Please try again.')}
                theme={isDark ? 'filled_black' : 'outline'}
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>
          )}

          {status && !loading && (
            <p style={{ marginTop: '14px', color: '#ef4444', fontSize: '13px', fontWeight: '500' }}>{status}</p>
          )}

          <p style={{ marginTop: '28px', fontSize: '11px', color: 'var(--muted)' }}>
            Secure Google sign-in · No files uploaded to servers
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
