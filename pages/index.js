import Head from "next/head";
import styles from "../styles/home.module.css";

const surfaces = [
  {
    name: "Explorer",
    href: "https://scan.tipschain.online",
    eyebrow: "Read the chain",
    detail:
      "Search blocks, transactions, addresses and verified contracts on the public scan surface.",
  },
  {
    name: "RPC",
    href: "https://rpc2.tipschain.org",
    eyebrow: "Run against the network",
    detail: "Point wallets, infra and indexers at the public RPC endpoint built on Besu JSON-RPC.",
  },
  {
    name: "Wallet",
    href: "https://wallet.tipspay.org",
    eyebrow: "User-facing surface",
    detail: "Jump into the wallet entrypoint for balances, transfers and network onboarding flows.",
  },
  {
    name: "DEX",
    href: "https://dex.tipspay.org",
    eyebrow: "Liquidity surface",
    detail: "Open the exchange route and continue into swap flows wired for the Tips ecosystem.",
  },
];

const features = [
  {
    title: "Built for tipping rails",
    body: "The repo positions TipsChain as a dedicated L1 for creator payments, rewards and low-friction consumer flows.",
  },
  {
    title: "Explorer-first credibility",
    body: "The landing hands new visitors to the live scan surface fast, instead of forcing them into raw infrastructure pages.",
  },
  {
    title: "EVM tooling path",
    body: "Contracts, wallet flows and RPC access stay in familiar Ethereum-style tooling, backed by Besu and documented deployment paths.",
  },
];

const stack = [
  "Hyperledger Besu execution",
  "QBFT-style validator network",
  "Chain ID 19251925",
  "TipCoin, USDTC and gasless support",
];

const operatorSheet = [
  ["Primary destination", "tipschain.org"],
  ["Explorer", "scan.tipschain.online"],
  ["Public RPC", "rpc2.tipschain.org"],
  ["Fallback RPC", "rpc.tipschain.org"],
];

export default function Home() {
  return (
    <>
      <Head>
        <title>TipsChain | Network Landing</title>
        <meta
          name="description"
          content="TipsChain network landing page with direct access to the explorer, RPC, wallet and DEX surfaces."
        />
        <meta property="og:title" content="TipsChain" />
        <meta
          property="og:description"
          content="Enter the network through a polished landing page, then move directly into the live explorer."
        />
        <meta name="theme-color" content="#07111f" />
      </Head>

      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.gridLines} />

          <header className={styles.nav}>
            <a className={styles.brand} href="#top">
              <span className={styles.brandMark} />
              TipsChain
            </a>

            <nav className={styles.navLinks}>
              <a href="#surfaces">Surfaces</a>
              <a href="#network">Network</a>
              <a href="#launch">Launch</a>
            </nav>
          </header>

          <div className={styles.heroContent} id="top">
            <div className={styles.copyColumn}>
              <span className={styles.kicker}>Consumer-ready chain access</span>
              <h1 className={styles.title}>
                TipsChain starts at <span>tipschain.org</span>, then moves cleanly into scan.
              </h1>
              <p className={styles.summary}>
                A proper front door for the network: brand-first, explorer-ready, and built to route
                first-time visitors into the live chain without dumping them into raw
                infrastructure.
              </p>

              <div className={styles.ctaRow}>
                <a
                  className={styles.primaryCta}
                  href="https://scan.tipschain.online"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Explorer
                </a>
                <a className={styles.secondaryCta} href="#surfaces">
                  View Network Access
                </a>
              </div>

              <div className={styles.heroMeta}>
                {stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <div className={styles.visualColumn} aria-hidden="true">
              <div className={styles.orbitShell}>
                <div className={styles.orbitRing} />
                <div className={styles.orbitRingInner} />
                <div className={styles.orbitCore}>
                  <strong>scan</strong>
                  <span>tipschain.online</span>
                </div>
                <div className={`${styles.signal} ${styles.signalA}`} />
                <div className={`${styles.signal} ${styles.signalB}`} />
                <div className={`${styles.signal} ${styles.signalC}`} />
              </div>

              <div className={styles.statusStrip}>
                <div>
                  <span>Status</span>
                  <strong>Network Live</strong>
                </div>
                <div>
                  <span>Explorer Route</span>
                  <strong>Direct to Scan</strong>
                </div>
                <div>
                  <span>Entry Pattern</span>
                  <strong>Apex then Verify</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className={styles.main}>
          <section className={styles.sectionIntro}>
            <p>
              The landing page handles orientation. The explorer handles detail. That split gives
              TipsChain a cleaner public face and keeps the scan surface focused on search,
              verification and chain data.
            </p>
          </section>

          <section className={styles.surfaceSection} id="surfaces">
            <div className={styles.sectionHeading}>
              <span>Network surfaces</span>
              <h2>Every public entrypoint, arranged for real users.</h2>
            </div>

            <div className={styles.surfaceList}>
              {surfaces.map((surface) => (
                <a
                  key={surface.name}
                  className={styles.surfaceRow}
                  href={surface.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <span>{surface.eyebrow}</span>
                    <strong>{surface.name}</strong>
                  </div>
                  <p>{surface.detail}</p>
                  <span className={styles.surfaceArrow}>Open</span>
                </a>
              ))}
            </div>
          </section>

          <section className={styles.networkSection} id="network">
            <div className={styles.sectionHeading}>
              <span>Why this structure works</span>
              <h2>Brand-led outside, chain-led inside.</h2>
            </div>

            <div className={styles.featureGrid}>
              {features.map((feature) => (
                <article key={feature.title} className={styles.feature}>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.operatorPanel}>
              <div className={styles.sectionHeading}>
                <span>Operator sheet</span>
                <h2>Fast reference for routing and publishing.</h2>
              </div>

              <div className={styles.operatorRows}>
                {operatorSheet.map(([label, value]) => (
                  <div className={styles.operatorRow} key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.statement}>
              <p>
                This gives the network the same behavioral pattern users already trust: open the
                brand domain first, understand what the chain is, then step directly into the
                explorer when they want raw on-chain detail.
              </p>
            </div>
          </section>

          <section className={styles.launchSection} id="launch">
            <div className={styles.launchCopy}>
              <span>Launch path</span>
              <h2>Use the apex domain as the front door. Keep scan fast and technical.</h2>
              <p>
                `tipschain.org` becomes the polished presentation layer. `scan.tipschain.online`
                stays the operational explorer. Visitors get a confident first impression, and power
                users still reach chain data in one click.
              </p>
            </div>

            <div className={styles.launchActions}>
              <a
                className={styles.primaryCta}
                href="https://scan.tipschain.online"
                target="_blank"
                rel="noreferrer"
              >
                Launch Scan
              </a>
              <a
                className={styles.secondaryCta}
                href="https://rpc2.tipschain.org"
                target="_blank"
                rel="noreferrer"
              >
                Open RPC
              </a>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
