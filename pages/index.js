// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const COLORS = {
  sage: '#8FAE8F',
  purple: '#6F5AA8',
  line: '#e6e6e6',
  bg: '#f8f9f8',
  ink: '#1e1e1e',
};

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const envMissing = !supabase;

  // If signed in, jump straight to /app
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/app');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace('/app');
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [router]);

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

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.ink, fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif' }}>
      {/* Header */}
      <div style={{ background: COLORS.sage, borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '14px 18px', display: 'flex', gap: 18, alignItems: 'center' }}>
          {/* White box with logo filling it */}
          <div style={{ width: 140, height: 140, borderRadius: 16, background: '#fff', overflow: 'hidden', flex: '0 0 auto' }}>
            <img
              src="https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg"
              alt="Companion Dog Project logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1 }}>Companion Dog Project</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>Puppy Weight Tracker</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '32px auto', padding: '0 16px' }}>
        {!envMissing ? null : (
          <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: 12, borderRadius: 10, marginBottom: 16 }}>
            Supabase keys aren’t available here. The page loads, but sign-in won’t work until environment variables are set.
          </div>
        )}

        <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <h1 style={{ margin: '4px 0 12px 0', fontSize: 22 }}>Welcome</h1>
          <p style={{ marginTop: 0 }}>Sign in with your email. We’ll send you a one-time link.</p>

          <form onSubmit={sendLink} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 14 }}>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ marginTop: 6, width: '100%', padding: '12px 12px', border: `1px solid ${COLORS.line}`, borderRadius: 10, outline: 'none' }}
              />
            </label>

            <button
              type="submit"
              disabled={sending || envMissing}
              style={{ padding: '12px 14px', borderRadius: 10, border: 'none', cursor: sending || envMissing ? 'not-allowed' : 'pointer', background: COLORS.purple, color: 'white', fontWeight: 600 }}
            >
              {sending ? 'Sending…' : 'Send sign-in link'}
            </button>

            {sent && (
              <div style={{ marginTop: 4, background: '#efe9ff', border: `1px solid ${COLORS.line}`, padding: 10, borderRadius: 10, fontSize: 14 }}>
                Check your email for the link.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
