import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Global header */}
      <header style={{ padding: "1rem", backgroundColor: "#f5f5f5" }}>
        <h2>Tips Ecosystem</h2>
      </header>

      {/* Page content */}
      <main style={{ padding: "2rem" }}>
        <Component {...pageProps} />
      </main>

      {/* Global footer */}
      <footer style={{ padding: "1rem", backgroundColor: "#f5f5f5" }}>
        <small>© {new Date().getFullYear()} Tips Ecosystem</small>
      </footer>
    </div>
  );
}
