import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase (only used to show “Signed in as …”)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AppLayout({ children }) {
  const [name, setName] = useState("");

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
      setName(prof?.display_name || "");
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app-shell">
      {/* SAGE band across the very top */}
      <div className="topband" />

      {/* Header with logo + title */}
      <header className="site-header">
        <div className="logo-box">
          <img src="/logo.svg" alt="CDP logo" />
          <span className="logo-fallback">CDP</span>
        </div>

        <h1 className="site-title">
          <span className="cdp">Companion Dog Project</span>
          <span className="dot"> • </span>
          <span className="app">Puppy Weight Tracker</span>
        </h1>

        <div className="spacer" />
        <div className="signed">{name ? `Signed in as ${name}` : ""}</div>
        <button className="btn ghost" onClick={signOut}>Sign out</button>
      </header>

      {/* Page content */}
      <main className="site-main">{children}</main>

      {/* Styles kept here so every page looks the same */}
      <style jsx global>{`
        :root{
          --sage:#9DB89D;      /* the green band */
          --purple:#5E4B8A;    /* accent */
          --ink:#111827;       /* text */
          --card:#ffffff;      /* white surfaces */
          --bg:#f6f7f8;        /* page background */
          --line:#e5e7eb;      /* borders */
        }

        html,body,#__next{height:100%;}
        body{
          margin:0;
          background:var(--bg);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                       Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }

        .app-shell{min-height:100%; display:flex; flex-direction:column;}

        .topband{height:10px; background:var(--sage);}

        .site-header{
          display:flex; align-items:center; gap:16px;
          padding:14px 18px;
          border-bottom:1px solid var(--line);
          background:var(--card);
        }

        .logo-box{
          position:relative;
          width:90px; height:90px;
          border:1px solid var(--line);
          border-radius:14px;
          background:#fff;
          display:grid; place-items:center;
          overflow:hidden;
        }
        .logo-box img{
          width:100%; height:100%; object-fit:contain;
        }
        .logo-fallback{
          position:absolute; font-size:12px; color:#999;
        }

        .site-title{margin:0; font-size:22px; font-weight:800;}
        .cdp{color:var(--ink);}
        .app{color:var(--purple);}
        .spacer{flex:1;}
        .signed{opacity:.85; font-size:14px; margin-right:8px;}

        .site-main{max-width:980px; width:100%; margin:20px auto; padding:0 20px;}

        .card{background:var(--card); border:1px solid var(--line);
              border-radius:14px; padding:16px;}

        .btn{
          padding:10px 12px; border-radius:12px;
          border:1px solid var(--purple);
          background:var(--purple); color:#fff; font-weight:700; cursor:pointer;
        }
        .btn.ghost{background:#fff; color:var(--ink); border-color:var(--line);}

        .label{display:block; font-size:13px; opacity:.85; margin-bottom:4px;}
        .input, select, textarea{
          width:100%; padding:10px 12px;
          border:1px solid var(--line); border-radius:10px; background:#fff;
        }
      `}</style>
    </div>
  );
}

