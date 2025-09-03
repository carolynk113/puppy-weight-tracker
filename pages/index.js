// pages/index.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const COLORS = {
  sage: '#8FAE8F',
  lemon: '#F2E35D',
  purple: '#6F5AA8',
  ink: '#1e1e1e',
  line: '#e6e6e6',
  bg: '#f8f9f8',
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const envMissing = !supabase;

  // Read session & react to auth changes
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email || '');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email || '');
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function sendLink(e) {
    e.preventDefault();
    if (!supabase) return alert('Supabase settings are missing on this site.');
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) alert(error.message);
    else setSent(true);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        color: COLORS.ink,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: `1px solid ${COLORS.line}`,
          background: COLORS.sage,
        }}
      >
        <img
          src="https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg"
          alt="Companion Dog Project logo"
          width={28}
          height={28}
          style={{ borderRadius: 6, background: '#ffffffa8', padding: 2 }}
        />
        <span style={{ fontWeight: 650 }}>Puppy Weight Tracker</span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '32px auto', padding: '0 16px' }}>
        {/* Warning if env not set (renders but disables auth) */}
        {envMissing && (
          <div
            style={{
              background: '#fff3cd',
              border: '1px solid #ffeeba',
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            Supabase keys aren’t available here. The page loads, but sign-in won’t
            work until environment variables are set.
          </div>
        )}

        {!userEmail ? (
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <h1 style={{ margin: '4px 0 12px 0', fontSize: 22 }}>Welcome</h1>
            <p style={{ marginTop: 0 }}>
              Sign in with your email. We’ll send you a one-time link.
            </p>

            <form onSubmit={sendLink} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <label style={{ fontSize: 14 }}>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    marginTop: 6,
                    width: '100%',
                    padding: '12px 12px',
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    outline: 'none',
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={sending || envMissing}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: sending || envMissing ? 'not-allowed' : 'pointer',
                  background: COLORS.purple,
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {sending ? 'Sending…' : 'Send sign-in link'}
              </button>

              {sent && (
                <div
                  style={{
                    marginTop: 4,
                    background: COLORS.lemon,
                    border: `1px solid ${COLORS.line}`,
                    padding: 10,
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                >
                  Check your email for the link.
                </div>
              )}
            </form>
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              border: `1px solid ${COLORS.line}`,
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              display: 'grid',
              gap: 16,
            }}
          >
            <div>
              Signed in as <b>{userEmail}</b>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="/app"
                style={{
                  textDecoration: 'none',
                  background: COLORS.lemon,
                  border: `1px solid ${COLORS.line}`,
                  color: COLORS.ink,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Go to App
              </a>
              <button
                onClick={signOut}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.line}`,
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer (subtle) */}
      <div style={{ textAlign: 'center', padding: '16px 12px', color: '#666', fontSize: 13 }}>
        <span>Brand colors: </span>
        <span style={{ background: COLORS.sage, padding: '2px 8px', borderRadius: 999, marginRight: 6 }}>
          sage
        </span>
        <span style={{ background: COLORS.lemon, padding: '2px 8px', borderRadius: 999, marginRight: 6 }}>
          lemon
        </span>
        <span style={{ background: COLORS.purple, padding: '2px 8px', borderRadius: 999 }}>
          purple
        </span>
      </div>
    </div>
  );
}
