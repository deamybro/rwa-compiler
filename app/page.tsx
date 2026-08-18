import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RWA Compiler — RWA Preflight for X Layer",
  description:
    "AI-powered RWA Passports and machine-enforceable safety policies for tokenized assets and autonomous agents.",
};

export default function Home() {
  const registryConfigured = Boolean(process.env.NEXT_PUBLIC_REGISTRY_ADDRESS);

  return (
    <main>
      <nav className="nav-shell" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="RWA Compiler home">
          <span className="brand-mark">R</span>
          <span>RWA Compiler</span>
        </Link>
        <div className="nav-links">
          <a href="/terminal">Terminal</a>
          <a href="/compiler">Compiler</a>
          <a href="/demo">Demo</a>
          <a href="/developers">Developers</a>
        </div>
        <a className="network-pill" href="/terminal">
          <span /> X Layer Data · Live
        </a>
      </nav>

      <section className="hero-shell">
        <div className="eyebrow">
          <span>RWA INTELLIGENCE INFRASTRUCTURE</span>
          <span className="eyebrow-line" />
          <span>BUILT ON X LAYER</span>
        </div>
        <h1>
          AI agents understand tokens.
          <span>RWA Compiler teaches them what those tokens actually mean.</span>
        </h1>
        <p className="hero-copy">
          Turn real-world asset rules, reserves, corporate actions and market
          state into verified onchain policies before capital moves.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="/terminal">
            Run preflight <span aria-hidden="true">↗</span>
          </a>
          <a className="button button-secondary" href="#passports">
            View live Passports
          </a>
        </div>

        <div className="preflight-window" id="passports">
          <div className="window-header">
            <div className="window-title">
              <span className="terminal-glyph">&gt;_</span>
              <span>PRE-FLIGHT TERMINAL</span>
            </div>
            <div className="window-meta">
              <span className="live-dot" /> SOURCE-VERIFIED PREVIEW
              <span>LIVE DATA VIA API</span>
            </div>
          </div>
          <div className="window-body">
            <div className="query-line">
              <span>preflight</span>
              <code>asset</code>
              <strong>NVDAx</strong>
              <code>action</code>
              <strong>SWAP</strong>
              <button type="button" aria-label="Run example preflight">→</button>
            </div>
            <div className="result-grid">
              <div className="allow-panel">
                <span className="panel-kicker">POLICY STATUS</span>
                <div className="allow-badge"><span>✓</span> ALLOW</div>
                <p>No blocking conditions detected.</p>
                <div className="verified-line"><span>◇</span> VERIFIED · 18s ago</div>
              </div>
              <div className="evidence-panel">
                <div className="evidence-row"><span>Asset identity</span><b>VERIFIED</b></div>
                <div className="evidence-row"><span>Proof of reserves</span><b>VERIFIED</b></div>
                <div className="evidence-row"><span>Multiplier</span><strong>1.000000</strong></div>
                <div className="evidence-row"><span>Corporate action</span><strong>NONE ACTIVE</strong></div>
                <div className="hash-row"><span>Passport hash</span><code>computed per request</code><b>{registryConfigured ? "REGISTRY CONFIGURED" : "REGISTRY PENDING"}</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pipeline" aria-label="RWA Compiler architecture">
        {[
          ["01", "REAL WORLD", "Documents + APIs"],
          ["02", "AI COMPILER", "Structured claims"],
          ["03", "VERIFICATION", "Deterministic checks"],
          ["04", "RWA PASSPORT", "Machine-readable state"],
          ["05", "X LAYER POLICY", "Onchain enforcement"],
          ["06", "SAFE EXECUTION", "Capital moves"],
        ].map(([number, title, detail], index) => (
          <div className="pipeline-step" key={title}>
            <span>{number}</span>
            <strong>{title}</strong>
            <small>{detail}</small>
            {index < 5 && <i aria-hidden="true">→</i>}
          </div>
        ))}
      </section>
    </main>
  );
}
