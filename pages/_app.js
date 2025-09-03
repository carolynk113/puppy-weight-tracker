// /pages/_app.js
import "../styles/globals.css";
import Head from "next/head";

// Your Supabase public logo URL:
const LOGO_URL =
  "https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Puppy Weight Tracker</title>
        {/* Inter font (remove if you don't want it) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* WIDE SAGE HEADER */}
      <header className="site-header">
        <div className="logo-box">
          <img src={LOGO_URL} alt="Companion Dog Project logo" />
          <span className="logo-fallback">CDP</span>
        </div>

        <h1 className="site-title">
          <span className="cdp">Companion Dog Project</span>
          <span className="dot"> • </span>
          <span className="app">Puppy Weight Tracker</span>
        </h1>

        <div className="spacer" />
      </header>

      {/* Page content area */}
      <main className="site-main">
        <Component {...pageProps} />
      </main>

      {/* Global styles (kept here so every page inherits the same header/look) */}
      <style jsx global>{`
        :root{
          --sage:#9DB89D;   /* wide band color */
          --purple:#5E4B8A; /* accent */
          --ink:#111827;    /* dark text */
          --card:#ffffff;   /* white */
          --bg:#f6f7f8;     /* page bg */
          --line:#e5e7eb;   /* borders (if needed) */
        }

        html, body, #__next { height: 100%; }
        body {
          margin: 0;
          background: var(--bg);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
                       Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }

        /* WIDE SAGE BAND + LARGE LOGO */
        .site-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px 24px;
          background: var(--sage);           /* <-- big sage band */
          color: var(--ink);
          min-height: 140px;                 /* <-- wide height */
        }

        .logo-box {
          position: relative;
          width: 140px;                      /* <-- large logo size */
          height: 140px;
          border-radius: 18px;
          background: #fff;
          display: grid;
          place-items: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          flex: 0 0 auto;
        }
        .logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .logo-fallback {
          position: absolute;
          font-size: 12px;
          color: #888;
        }

        .site-title {
          margin: 0;
          font-size: 28px;                   /* bigger title */
          font-weight: 800;
          line-height: 1.2;
        }
        .cdp { color: var(--ink); }
        .app { color: var(--purple); }
        .spacer { flex: 1; }

        /* Content container */
        .site-main {
          max-width: 980px;
          width: 100%;
          margin: 24px auto;
          padding: 0 20px;
        }

        /* Handy utility styles you can reuse anywhere */
        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
        }
        .label { display:block; font-size:13px; opacity:.85; margin-bottom:4px; }
        .input, select, textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: #fff;
        }

        /* Keep things neat on small screens */
        @media (max-width: 640px) {
          .site-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 20px;
            min-height: unset;
          }
          .logo-box {
            width: 120px;
            height: 120px;
          }
          .site-title {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}

