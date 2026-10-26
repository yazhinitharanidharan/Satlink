import { useState } from 'react';
import { SatelliteDish, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login, authError, clearAuthError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (loginError) {
      setError(loginError?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const message = error || authError;

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <SatelliteDish size={28} />
          </div>
          <div>
            <h1>SATLINK</h1>
            <p>Satellite Communication & Ground Station Management</p>
          </div>
        </div>

        <div className="login-heading">
          <ShieldCheck size={18} />
          <span>Secure operator access</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
                clearAuthError();
              }}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
                clearAuthError();
              }}
              disabled={submitting}
            />
          </div>

          {message && (
            <div className="login-error" role="alert">
              {message}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login-note">
          Use an account created in the SATLINK database. Contact an administrator
          if you need access.
        </p>
      </div>
    </div>
  );
};

export default Login;
