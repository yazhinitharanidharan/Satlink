import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem', textAlign: 'center' }}>
    <Compass size={40} style={{ color: 'var(--accent-primary)' }} />
    <h1 style={{ color: 'var(--text-primary)' }}>Page not found</h1>
    <p style={{ color: 'var(--text-secondary)' }}>The page you requested does not exist in SATLINK.</p>
    <Link to="/">Return to Mission Control</Link>
  </div>
);

export default NotFound;
