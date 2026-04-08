import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${bodyFont.variable} ${displayFont.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
