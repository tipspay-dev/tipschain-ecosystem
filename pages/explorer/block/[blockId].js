/**
 * Explorer - Block Details Page
 */

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/explorer.module.css";

export default function BlockDetails() {
  const router = useRouter();
  const { blockId } = router.query;
  const [block, setBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blockId) return;

    const fetchBlock = async () => {
      try {
        const res = await fetch(`/api/explorer/block?number=${blockId}`);
        const data = await res.json();
        setBlock(data);

        const txRes = await fetch(`/api/explorer/block-transactions?number=${blockId}`);
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      } catch (error) {
        console.error("Failed to fetch block:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [blockId]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!block) return <div className={styles.container}>Block not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/explorer">Explorer</Link> / Block {block.number}
      </div>

      <h1>Block #{block.number}</h1>

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <h3>Block Information</h3>
          <dl>
            <dt>Block Number</dt>
            <dd>{block.number}</dd>
            <dt>Block Hash</dt>
            <dd className={styles.hash}>{block.hash}</dd>
            <dt>Parent Hash</dt>
            <dd className={styles.hash}>{block.parent}</dd>
            <dt>Timestamp</dt>
            <dd>{new Date(block.timestamp * 1000).toISOString()}</dd>
            <dt>Miner</dt>
            <dd>
              <Link href={`/explorer/address/${block.miner}`}>{block.miner}</Link>
            </dd>
          </dl>
        </div>

        <div className={styles.detailCard}>
          <h3>Network Data</h3>
          <dl>
            <dt>Transactions</dt>
            <dd>{block.transactionCount}</dd>
            <dt>Gas Limit</dt>
            <dd>{(parseInt(block.gasLimit) / 1e6).toFixed(2)} M</dd>
            <dt>Gas Used</dt>
            <dd>{(parseInt(block.gasUsed) / 1e6).toFixed(2)} M</dd>
            <dt>Gas Used %</dt>
            <dd>{((parseInt(block.gasUsed) / parseInt(block.gasLimit)) * 100).toFixed(2)}%</dd>
            <dt>Difficulty</dt>
            <dd>{block.difficulty}</dd>
          </dl>
        </div>
      </div>

      {/* Transactions */}
      <div className={styles.section}>
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions in this block</p>
        ) : (
          <div className={styles.txList}>
            {transactions.map((tx) => (
              <Link key={tx.hash} href={`/explorer/tx/${tx.hash}`} className={styles.txRow}>
                <div className={styles.txHash}>{tx.hash.slice(0, 20)}...</div>
                <div className={styles.txFrom}>{tx.from.slice(0, 10)}...</div>
                <div>→</div>
                <div className={styles.txTo}>{tx.to?.slice(0, 10) || "0x"}...</div>
                <div>{parseFloat(tx.value).toFixed(4)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
