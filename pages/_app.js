// /pages/_app.js
import "../styles/globals.css";
import Head from "next/head";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client for session handling
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Your Supabase logo URL
const LOGO_URL =
  "https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg";

export default function MyApp({ Component, pageProps }) {
  // A) Turn magic-link params into a session (supports new and legacy flows)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    const run = async () => {
      // New flow: ?code=...
      const code = url.searchParams.get("code");
      const err = url.searchParams.get("error_description");
      if (err) alert(decodeURIComponent(err));
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (!error) {
          window.history.replaceState({}, "", "/app"); // stay on /app
          return;
        }
        alert(error.message);
      }

      // Legacy flow: #access_token&refresh_token
      if (window.location.hash.includes("access_token")) {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const at = params.get("access_token");
        const rt = params.get("refresh_token");
        const e2 = params.get("error_description");
        if (e2) alert(decodeURIComponent(e2));
        if (at && rt) {
          const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
          if (!error) {
            window.history.replaceState({}, "", "/app");
            return;
          }
          alert(error.message);
        }
      }
    };
    run();
  }, []);

  // B) If already logged in and stuck on "/", nudge to /app
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/app");
    });
  }, []);

  return (
    <>
      <Head>
        <title>Puppy Weight Tracker</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* WIDE SAGE HEADER */}
      <header className="site-header">
        <div className="logo-box">
          {/* alt is empty so no text ever shows; also hide any stray children */}
          <img src={LOGO_URL} alt="" />
        </div>

        <h1 className="site-title">
          <span className="cdp">Companion Dog Project</span>
          <span className="dot"> • </span>
          <span className="app">Puppy Weight Tracker</span>
        </h1>

        <div className="spacer" />
      </header>

      <main className="site-main">
        <Component {...pageProps} />
      </main>

      <style jsx global>{`
        :root{
          --sage:#9DB89D;
          --purple:#5E4B8A;
          --ink:#111827;
          --card:#ffffff;
          --bg:#f6f7f8;
          --line:#e5e7eb;
        }

        html, body, #__next { height: 100%; }
        body {
          margin: 0;
          background: var(--bg);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                       Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }

        /* WIDE SAGE HEADER */
        .site-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: var(--sage);
          color: var(--ink);
          min-height: 140px;
        }
        .logo-box {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 18px;
          background: #fff;
          display: grid;
          place-items: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          flex: 0 0 auto;
          /* if anything except the image slips in, hide it */
          font-size: 0; line-height: 0;
        }
        .logo-box img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .logo-box :not(img) { display: none !important; }  /* nuke any fallback text */

        .site-title { margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2; }
        .cdp { color: var(--ink); }
        .app { color: var(--purple); }
        .spacer { flex: 1; }

        .site-main {
          max-width: 980px;
          width: 100%;
          margin: 24px auto;
          padding: 0 20px;
        }

        /* FORCE ALL BUTTONS PURPLE (unchanged) */
        button,
        .btn,
        .btn.primary,
        .btn.ghost,
        .iconBtn,
        input[type="button"],
        input[type="submit"],
        input[type="reset"] {
          background: var(--purple) !important;
          border: 1px solid var(--purple) !important;
          color: #fff !important;
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled,
        .btn:disabled,
        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Inputs */
        .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px; }
        .label { display:block; font-size:13px; opacity:.85; margin-bottom:4px; }
        .input, select, textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: #fff;
        }

        @media (max-width: 640px) {
          .site-header { flex-direction: column; align-items: flex-start; gap: 14px; min-height: unset; }
          .logo-box { width: 120px; height: 120px; }
          .site-title { font-size: 24px; }
        }
      `}</style>
    </>
  );
}

