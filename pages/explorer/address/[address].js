/**
 * Explorer - Address Details Page
 */

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/explorer.module.css";

export default function AddressDetails() {
  const router = useRouter();
  const { address } = router.query;
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState("transactions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const fetchAddress = async () => {
      try {
        const res = await fetch(`/api/explorer/address?address=${address}`);
        const data = await res.json();
        setAccount(data);

        const txRes = await fetch(`/api/explorer/address-transactions?address=${address}`);
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);

        const tokRes = await fetch(`/api/explorer/address-tokens?address=${address}`);
        const tokData = await tokRes.json();
        setTokens(tokData.transfers || []);
      } catch (error) {
        console.error("Failed to fetch address:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [address]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!account) return <div className={styles.container}>Address not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/explorer">Explorer</Link> / Address
      </div>

      <h1>Address {account.address}</h1>

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <h3>Overview</h3>
          <dl>
            <dt>Address</dt>
            <dd className={styles.hash}>{account.address}</dd>
            <dt>Balance</dt>
            <dd className={styles.balance}>{account.balance} ETH</dd>
            <dt>Transactions</dt>
            <dd>{account.transactionCount}</dd>
            <dt>Type</dt>
            <dd>{account.isContract ? "Contract" : "Account"}</dd>
          </dl>
        </div>

        {account.isContract && (
          <div className={styles.detailCard}>
            <h3>Contract</h3>
            <dl>
              <dt>Code Size</dt>
              <dd>{account.codeSize} bytes</dd>
            </dl>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "transactions" ? styles.active : ""}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions ({transactions.length})
        </button>
        <button
          className={activeTab === "tokens" ? styles.active : ""}
          onClick={() => setActiveTab("tokens")}
        >
          Token Transfers ({tokens.length})
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className={styles.section}>
          {transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <div className={styles.txList}>
              {transactions.map((tx) => (
                <Link key={tx.hash} href={`/explorer/tx/${tx.hash}`} className={styles.txRow}>
                  <div className={styles.txHash}>{tx.hash.slice(0, 20)}...</div>
                  <div>{new Date(tx.blockNumber * 1000).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tokens Tab */}
      {activeTab === "tokens" && (
        <div className={styles.section}>
          {tokens.length === 0 ? (
            <p>No token transfers found</p>
          ) : (
            <div className={styles.tokenList}>
              {tokens.map((token, idx) => (
                <div key={idx} className={styles.tokenRow}>
                  <Link href={`/explorer/address/${token.token}`}>
                    {token.token.slice(0, 15)}...
                  </Link>
                  <span> from </span>
                  <Link href={`/explorer/address/${token.from}`}>{token.from.slice(0, 15)}...</Link>
                  <span> amount: {token.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
