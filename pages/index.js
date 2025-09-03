import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const send = async () => {
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/app`;
    const { error } = await supabase.auth.signInWithOtp({ email }, { emailRedirectTo: redirectTo });
    if (error) alert(error.message); else setSent(true);
  };

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>Sign in</h2>
      {sent ? (
        <div>Check your email for the sign-in link.</div>
      ) : (
        <>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={send} disabled={!email}>Send magic link</button>
          </div>
        </>
      )}
    </div>
  );
}

