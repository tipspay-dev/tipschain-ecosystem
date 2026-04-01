/**
 * Explorer - Transaction Details Page
 */

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/explorer.module.css";

export default function TransactionDetails() {
  const router = useRouter();
  const { txHash } = router.query;
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txHash) return;

    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/explorer/transaction?hash=${txHash}`);
        const data = await res.json();
        setTx(data);
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txHash]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!tx) return <div className={styles.container}>Transaction not found</div>;

  const statusClass = tx.status === "Success" ? "success" : "failed";

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/explorer">Explorer</Link> / Transaction
      </div>

      <h1>Transaction Details</h1>

      <div className={styles.statusBanner + " " + styles[statusClass]}>Status: {tx.status}</div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <h3>Transaction Information</h3>
          <dl>
            <dt>Transaction Hash</dt>
            <dd className={styles.hash}>{tx.hash}</dd>
            <dt>Block Number</dt>
            <dd>
              <Link href={`/explorer/block/${tx.blockNumber}`}>{tx.blockNumber}</Link>
            </dd>
            <dt>Status</dt>
            <dd className={styles[statusClass]}>{tx.status}</dd>
            <dt>From</dt>
            <dd>
              <Link href={`/explorer/address/${tx.from}`}>{tx.from}</Link>
            </dd>
            <dt>To</dt>
            <dd>
              {tx.to ? (
                <Link href={`/explorer/address/${tx.to}`}>{tx.to}</Link>
              ) : (
                "Contract Creation"
              )}
            </dd>
          </dl>
        </div>

        <div className={styles.detailCard}>
          <h3>Value & Gas</h3>
          <dl>
            <dt>Value</dt>
            <dd>{tx.value} ETH</dd>
            <dt>Gas Price</dt>
            <dd>{tx.gasPrice} Gwei</dd>
            <dt>Gas Limit</dt>
            <dd>{tx.gas}</dd>
            <dt>Gas Used</dt>
            <dd>{tx.gasUsed || "Pending"}</dd>
            <dt>Nonce</dt>
            <dd>{tx.nonce}</dd>
          </dl>
        </div>
      </div>

      {tx.input && tx.input !== "0x" && (
        <div className={styles.detailCard}>
          <h3>Input Data</h3>
          <pre className={styles.codeBlock}>{tx.input}</pre>
        </div>
      )}

      {tx.contractAddress && (
        <div className={styles.detailCard}>
          <h3>Contract Deployment</h3>
          <dl>
            <dt>Contract Address</dt>
            <dd>
              <Link href={`/explorer/address/${tx.contractAddress}`}>{tx.contractAddress}</Link>
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}
