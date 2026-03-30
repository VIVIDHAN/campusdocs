export default function Navbar({ user, onLogout }) {
  return (
    <nav className="no-print" style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 40px', 
      backgroundColor: '#ffffff', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🎓 CampusDocs
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ color: '#475569', fontWeight: '600', fontSize: '15px' }}>
          {user.name}
        </span>
        <button 
          onClick={onLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f1f5f9', 
            color: '#ef4444', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}