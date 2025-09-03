// pages/index.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // read current session and watch for changes
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email || '');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email || '');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendLink(e) {
    e.preventDefault();
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
    await supabase.auth.signOut();
  }

  return (
    <div style={{maxWidth: 420, margin: '60px auto', fontFamily: 'system-ui, sans-serif'}}>
      {/* Logo placeholder at top */}
      <div style={{textAlign:'center', marginBottom: 24}}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, border: '1px solid #ccc',
          display:'inline-flex', alignItems:'center', justifyContent:'center'
        }}>LOGO</div>
        <h1 style={{marginTop: 12}}>Puppy Weight Tracker</h1>
      </div>

      {!userEmail ? (
        <form onSubmit={sendLink} style={{display:'grid', gap: 12}}>
          <label>Email for sign-in link</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{padding:10, border:'1px solid #ccc', borderRadius:8}}
          />
          <button
            type="submit"
            disabled={sending}
            style={{padding:'10px 14px', borderRadius:8, border:'1px solid #ccc', cursor:'pointer'}}
          >
            {sending ? 'Sending…' : 'Send me a sign-in link'}
          </button>
          {sent && <p>Check your email for the link.</p>}
        </form>
      ) : (
        <div style={{display:'grid', gap:12}}>
          <p>Signed in as <b>{userEmail}</b></p>
          <button onClick={signOut} style={{padding:'10px 14px', borderRadius:8, border:'1px solid #ccc', cursor:'pointer'}}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
