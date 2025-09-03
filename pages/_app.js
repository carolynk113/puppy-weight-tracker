// /pages/_app.js
import "../styles/globals.css";
import Head from "next/head";

// Supabase public logo URL
const LOGO_URL =
  "https://mybbpohhluctmqvfsdfz.supabase.co/storage/v1/object/public/logo/companion%20dog%20project%20(2).svg";

export default function MyApp({ Component, pageProps }) {
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
          {/* removed fallback text so nothing shows under the logo */}
          <img src={LOGO_URL} alt="Companion Dog Project logo" />
        </div>

        <h1 className="site-title">
          <span className="cdp">Companion Dog Project</span>
          <span className="dot"> • </span>
          <span className="app">Puppy Weight Tracker</span>
        </h1>

        <div className="spacer" />
      </header>

      {/* Page content */}
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

        /* Wide sage band + large logo */
        .site-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px 24px;
          background: var(--sage);
          color: var(--ink);
          min-height: 140px;
        }
        .logo-box {
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
        }
        .logo-box img { width: 100%; height: 100%
