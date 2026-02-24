export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
          <p style={{ fontSize: '1.5rem', color: '#666' }}>Page not found</p>
          <a href="/" style={{ 
            marginTop: '2rem', 
            padding: '0.75rem 2rem', 
            background: '#3b82f6', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '0.5rem' 
          }}>
            Go Home
          </a>
        </div>
      </body>
    </html>
  );
}
