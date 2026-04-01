/**
 * Explorer - Main Page
 * Homepage for Blockscout explorer
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/explorer.module.css";

export default function Explorer() {
  const [stats, setStats] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchBlocks();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/explorer/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await fetch("/api/explorer/blocks?limit=10");
      const data = await res.json();
      setBlocks(data.blocks || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/explorer/search?q=${searchQuery}`);
      const data = await res.json();

      if (data.type === "block") {
        window.location.href = `/explorer/block/${data.result.number}`;
      } else if (data.type === "transaction") {
        window.location.href = `/explorer/tx/${data.result.hash}`;
      } else if (data.type === "address") {
        window.location.href = `/explorer/address/${data.result.address}`;
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className={styles.explorer}>
      <div className={styles.header}>
        <h1>TipsChain Block Explorer</h1>
        <p>Scan the blockchain | scan.tipspay.org</p>
      </div>

      {/* Network Stats */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Latest Block</div>
            <div className={styles.statValue}>{stats.blockNumber}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gas Price</div>
            <div className={styles.statValue}>{parseFloat(stats.gasPrice).toFixed(2)} Gwei</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Chain ID</div>
            <div className={styles.statValue}>{stats.chainId}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Network</div>
            <div className={styles.statValue}>{stats.chainName}</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by address, txn hash, token, block..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {/* Latest Blocks */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Latest Blocks</h2>
          <Link href="/explorer/blocks">View All</Link>
        </div>

        {loading ? (
          <p>Loading blocks...</p>
        ) : (
          <div className={styles.blocksList}>
            <div className={styles.blockHeader}>
              <div>Block</div>
              <div>Transactions</div>
              <div>Miner</div>
              <div>Gas Used</div>
              <div>Time</div>
            </div>
            {blocks.map((block) => (
              <Link
                key={block.number}
                href={`/explorer/block/${block.number}`}
                className={styles.blockRow}
              >
                <div className={styles.blockNumber}>{block.number}</div>
                <div>{block.transactionCount}</div>
                <div className={styles.address}>{block.miner.slice(0, 10)}...</div>
                <div>{(parseInt(block.gasUsed) / 1e6).toFixed(2)} M</div>
                <div>{new Date(block.timestamp * 1000).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
