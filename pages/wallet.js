/**
 * Wallet Page - Web3 Wallet Interface
 */

import { useState } from "react";
import styles from "../styles/wallet.module.css";

export default function Wallet() {
  const [connected, setConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install it.");
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      setUserAddress(address);

      // Fetch balance
      const res = await fetch(`/api/wallet/balance?address=${address}`);
      const data = await res.json();
      setBalance(data.balance);

      setConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setUserAddress("");
    setBalance("0");
  };

  return (
    <div className={styles.container}>
      <h1>Web3 Wallet</h1>

      <div className={styles.card}>
        {!connected ? (
          <button className={styles.button} onClick={connectWallet} disabled={loading}>
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div>
            <h2>Connected Wallet</h2>
            <div className={styles.info}>
              <label>Address</label>
              <p className={styles.address}>{userAddress}</p>

              <label>TIPS Balance</label>
              <p className={styles.balance}>{balance} TIPS</p>
            </div>

            <button className={styles.buttonSecondary} onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      {connected && (
        <div className={styles.card}>
          <h2>Quick Actions</h2>
          <div className={styles.actions}>
            <a href="/explorer/address/[address]" className={styles.button}>
              View on Explorer
            </a>
            <a href="/dex" className={styles.button}>
              Go to DEX
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
