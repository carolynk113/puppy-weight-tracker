import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AppLayout({ children }) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      setDisplayName(prof?.display_name || "");
    })();
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="logo-box">
          <img src="/logo.svg" alt="Companion Dog Project" />
        </div>
        <h1 className="site-title">
          <span className="cdp">Companion Dog Project</span>
          <span className="dot"> • </span>
          <span className="app">Puppy Weight Tracker</span>
        </h1>
        <div className="signed">
          {displayName ? `Signed in as ${displayName}` : "You’re signed in"}
        </div>
      </header>

      <main className="site-main">{children}</main>

      <style jsx global>{`
        :root{
          /* UI colors (not puppy collar choices) */
          --sage:#9DB89D;
          --lemon:#F2E9A6;
          --purple:#5E4B8A;
          --ink:#111827;
          --card:#ffffff;
          --bg:#f6f7f8;
          --line:#e5e7eb;
        }
        html,body,#__next{height:100%;}
        body{background:var(--bg);}
        .app-shell{min-height:100%; display:flex; flex-direction:column;}
        .site-header{
          display:flex; align-items:center; gap:16px;
          padding:16px 20px; border-bottom:1px solid var(--line); background:var(--card);
        }
        .logo-box{
          width:80px; height:80px; border:1px solid var(--line); border-radius:14px;
          background:#fff; overflow:hidden; display:grid; place-items:center;
        }
        .logo-box img{width:100%; height:100%; object-fit:contain;}
        .site-title{margin:0; font-size:22px; font-weight:800; color:var(--ink);}
        .cdp{color:var(--ink)}
        .app{color:var(--purple)}
        .signed{margin-left:auto; opacity:.85; font-size:14px}
        .site-main{max-width:980px; width:100%; margin:20px auto; padding:0 20px;}

        /* Shared UI pieces */
        .card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px;}
        .btn{padding:12px 14px; border-radius:12px; border:1px solid var(--purple); background:var(--purple); color:#fff; font-weight:700; cursor:pointer;}
        .btn.ghost{background:#fff; color:var(--ink); border-color:var(--line)}
        .input, select, textarea{width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px; background:#fff;}
        .label{display:block; font-size:13px; opacity:.85; margin-bottom:4px;}
        .row{display:flex; gap:12px; align-items:center;}
        .backdrop{position:fixed; inset:0; background:rgba(0,0,0,.35); display:grid; place-items:center; z-index:50; padding:20px;}
        .sheet{width:100%; max-width:820px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:16px;}
      `}</style>
    </div>
  );
}
