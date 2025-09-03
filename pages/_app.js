// pages/app/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const COLORS = { sage:'#8FAE8F', line:'#e6e6e6', ink:'#1e1e1e' };

export default function AppHome(){
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(()=>{
    if (!supabase) { router.replace('/'); return; }
    supabase.auth.getSession().then(({data})=>{
      const em = data.session?.user?.email;
      if(!em) router.replace('/'); else setEmail(em);
    });
  },[router]);

  if(!email) return null;

  return (
    <div style={{minHeight:'100vh',fontFamily:'system-ui,sans-serif',color:COLORS.ink,background:'#f8f9f8'}}>
      <div style={{ background: COLORS.sage, borderBottom:`1px solid ${COLORS.line}` }}>
        <div style={{ maxWidth:980, margin:'0 auto', padding:'14px 18px', fontWeight:800, fontSize:20 }}>
          Puppy Weight Tracker — App
        </div>
      </div>

      <div style={{ maxWidth: 560, margin:'32px auto', background:'#fff', border:`1px solid ${COLORS.line}`, borderRadius:16, padding:20 }}>
        <p style={{marginTop:0}}>Signed in as <b>{email}</b></p>
        {/* Placeholder buttons — real features next */}
        <div style={{display:'grid', gap:12}}>
          <button style={{padding:'10px 14px', borderRadius:10, border:`1px solid ${COLORS.line}`}}>Add Litter</button>
          <button style={{padding:'10px 14px', borderRadius:10, border:`1px solid ${COLORS.line}`}}>Choose Existing</button>
        </div>
      </div>
    </div>
  );
}
