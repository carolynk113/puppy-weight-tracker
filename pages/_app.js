// /pages/_app.js
import "../styles/globals.css";
import Head from "next/head";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client for magic-link session exchange
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Your Supabase logo URL
const LOGO_URL =
  "https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg";

export default function MyApp({ Component, pageProps }) {
  // Exchange ?code= from the magic link for a session (no UI changes)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const errorDesc = url.searchParams.get("error_description");
    if (errorDesc) alert(decodeURIComponent(errorDesc));
    if (!code) return;

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession({ code });
      if (error) { alert(error.message); return; }
      // Clean up the URL and land on /app
      window.history.replaceState({}, "", "/app");
    })();
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

      {/* Wide sage band + large logo */}
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

        /* FORCE ALL BUTTONS PURPLE (unchanged from your file) */
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
