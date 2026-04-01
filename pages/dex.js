/**
 * DEX Page - Decentralized Exchange Interface
 */

import { useState, useEffect } from "react";
import styles from "../styles/dex.module.css";

export default function DEX() {
  const [tokens, setTokens] = useState([]);
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/dex/tokens");
      const data = await res.json();
      setTokens(data.tokens || []);
      if (data.tokens && data.tokens.length > 0) {
        setTokenIn(data.tokens[0].address);
        if (data.tokens.length > 1) {
          setTokenOut(data.tokens[1].address);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    }
  };

  const getSwapQuote = async () => {
    if (!tokenIn || !tokenOut || !amountIn) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/dex/swap-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenInAddress: tokenIn,
          tokenOutAddress: tokenOut,
          amountIn: amountIn,
        }),
      });
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error("Failed to get quote:", error);
      alert("Failed to get swap quote");
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quote) {
      alert("Please get a quote first");
      return;
    }

    try {
      setLoading(true);
      // Call relayer for gassless swap
      const res = await fetch("/api/dex/gassless-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: "0x0000000000000000000000000000000000000000", // Would be retrieved from wallet
          swapData: quote,
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Swap successful! Transaction: ${data.txHash}`);
      } else {
        alert(`Swap failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Failed to execute swap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Decentralized Exchange</h1>

      <div className={styles.card}>
        <h2>Swap Tokens (Gassless)</h2>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>From Token</label>
            <select value={tokenIn} onChange={(e) => setTokenIn(e.target.value)}>
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Amount</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>To Token</label>
            <select value={tokenOut} onChange={(e) => setTokenOut(e.target.value)}>
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.button} onClick={getSwapQuote} disabled={loading}>
            {loading ? "Loading..." : "Get Quote"}
          </button>
        </div>

        {quote && (
          <div className={styles.quote}>
            <h3>Swap Quote</h3>
            <p>Amount Out: {quote.amountOut}</p>
            <p>Price Impact: {quote.priceImpact}</p>
            <button className={styles.buttonPrimary} onClick={executeSwap} disabled={loading}>
              {loading ? "Executing..." : "Execute Gassless Swap"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
