import { motion } from 'motion/react';
import * as React from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  MoreHorizontal,
  Copy,
  ExternalLink,
  ChevronRight,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Token } from '@/src/types';
import { NETWORK_CONFIG } from '@/src/config';
import { useTransactions, Transaction } from '../context/TransactionContext';
import { TPCCoin, USDTCoin, WTPCCoin } from './Icons';

const mockTokens: Token[] = [
  { id: '1', symbol: 'TPC', name: 'Tipscoin', balance: 0, price: 0, change24h: 0, icon: 'tpc', color: 'primary' },
  { id: '2', symbol: 'WTPC', name: 'Wrapped TPC', balance: 0, price: 0, change24h: 0, icon: 'wtpc', color: 'purple-400' },
  { id: '3', symbol: 'USDTC', name: 'USDTips', balance: 0, price: 0, change24h: 0, icon: 'usdc', color: 'green-500' },
];

const WALLET_ADDRESS_STORAGE_KEY = 'tipspay_wallet_address';

const TokenIcon = ({ symbol }: { symbol: string }) => {
  switch (symbol) {
    case 'TPC': return <TPCCoin className="w-full h-full" />;
    case 'USDTC': return <USDTCoin className="w-full h-full" />;
    case 'WTPC': return <WTPCCoin className="w-full h-full" />;
    default: return <div className="text-2xl">💰</div>;
  }
};

const shortenAddress = (value: string, head = 6, tail = 4) =>
  value.length > head + tail ? `${value.slice(0, head)}...${value.slice(-tail)}` : value;

const createLocalWalletAddress = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
};

const createMockHash = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
};

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const getIcon = () => {
    switch (tx.type) {
      case 'send': return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'receive': return <ArrowDownLeft className="w-5 h-5 text-secondary" />;
      case 'swap': return <ArrowLeftRight className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusIcon = () => {
    switch (tx.status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-secondary" />;
      case 'failed': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'pending': return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
    }
  };

  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          {getIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold capitalize">{tx.type} {tx.token}</p>
            {getStatusIcon()}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${tx.type === 'receive' ? 'text-secondary' : 'text-white'}`}>
          {tx.type === 'receive' ? '+' : '-'}{tx.amount}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground opacity-50 truncate w-20 ml-auto">
          {tx.hash?.substring(0, 10)}...
        </p>
      </div>
    </div>
  );
};

export default function WalletDashboard() {
  const { transactions, addTransaction } = useTransactions();
  const totalBalance = mockTokens.reduce((acc, token) => acc + (token.balance * token.price), 0);
  const [walletAddress, setWalletAddress] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [sendOpen, setSendOpen] = React.useState(false);
  const [receiveOpen, setReceiveOpen] = React.useState(false);
  const [sendTo, setSendTo] = React.useState('');
  const [sendAmount, setSendAmount] = React.useState('');
  const [sendToken, setSendToken] = React.useState(mockTokens[0].symbol);

  React.useEffect(() => {
    const storedAddress = localStorage.getItem(WALLET_ADDRESS_STORAGE_KEY) || createLocalWalletAddress();
    localStorage.setItem(WALLET_ADDRESS_STORAGE_KEY, storedAddress);
    setWalletAddress(storedAddress);
  }, []);

  React.useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setStatusMessage(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const copyToClipboard = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setStatusMessage(message);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Clipboard write failed', error);
      setStatusMessage('Clipboard access was blocked in this browser.');
    }
  };

  const openExternal = (url: string) => {
    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.href = url;
    }
  };

  const handleBuy = () => {
    openExternal(NETWORK_CONFIG.dex);
  };

  const handleBridge = () => {
    openExternal(NETWORK_CONFIG.dex);
  };

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^0x[a-fA-F0-9]{40}$/.test(sendTo)) {
      setStatusMessage('Enter a valid EVM address to send funds.');
      return;
    }

    const parsedAmount = Number(sendAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setStatusMessage('Enter a valid amount greater than zero.');
      return;
    }

    addTransaction({
      type: 'send',
      token: sendToken,
      amount: parsedAmount.toFixed(4),
      status: 'completed',
      hash: createMockHash(),
      from: walletAddress,
      to: sendTo,
    });

    setSendOpen(false);
    setSendTo('');
    setSendAmount('');
    setSendToken(mockTokens[0].symbol);
    setStatusMessage(`${sendToken} transfer added to local wallet history.`);
  };

  const handleViewHistory = () => {
    if (!walletAddress) return;
    openExternal(`${NETWORK_CONFIG.explorer}/address/${walletAddress}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-muted-foreground font-medium mb-1 uppercase tracking-widest text-xs">Total Balance</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tighter">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 neon-text-green">
                0% Today
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <a
                href={walletAddress ? `${NETWORK_CONFIG.explorer}/address/${walletAddress}` : NETWORK_CONFIG.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="text-xs font-mono">{walletAddress ? shortenAddress(walletAddress) : 'Generating...'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => walletAddress && copyToClipboard(walletAddress, 'Wallet address copied.')}
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {statusMessage && (
              <p className="mt-3 text-xs text-secondary">{statusMessage}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBuy} className="rounded-2xl h-14 px-6 bg-primary hover:bg-primary/80 neon-border-purple gap-2">
              <Plus className="w-5 h-5" />
              Buy
            </Button>
            <Button onClick={() => setSendOpen(true)} variant="outline" className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Send
            </Button>
            <Button onClick={() => setReceiveOpen(true)} variant="outline" className="rounded-2xl h-14 px-6 border-white/10 hover:bg-white/5 gap-2">
              <ArrowDownLeft className="w-5 h-5" />
              Receive
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-panel border-none rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Assets</CardTitle>
              <Button onClick={handleViewHistory} variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                View on Explorer
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {mockTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                        <TokenIcon symbol={token.symbol} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{token.balance.toLocaleString()} {token.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(token.balance * token.price).toLocaleString()}
                        <span className={token.change24h >= 0 ? 'text-secondary ml-2' : 'text-red-400 ml-2'}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="glass-panel border-none rounded-3xl bg-gradient-to-br from-primary/20 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg">TipsBridge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">Move your assets to Tipschain L1 instantly with zero fees.</p>
                <Button onClick={handleBridge} className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold">
                  Bridge Now
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {transactions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {transactions.map((tx) => (
                        <TransactionItem key={tx.id} tx={tx} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <RefreshCw className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground">No transactions yet.</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Swaps on DEX will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
                <Button onClick={handleViewHistory} variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-white gap-2">
                  View Full History
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-background border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Send Assets</DialogTitle>
            <DialogDescription>
              Create a local send action and record it in wallet history.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Recipient address</label>
              <Input
                value={sendTo}
                onChange={(event) => setSendTo(event.target.value)}
                placeholder="0x..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Amount</label>
                <Input
                  value={sendAmount}
                  onChange={(event) => setSendAmount(event.target.value)}
                  placeholder="0.0"
                  inputMode="decimal"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Token</label>
                <select
                  value={sendToken}
                  onChange={(event) => setSendToken(event.target.value)}
                  className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm outline-none"
                >
                  {mockTokens.map((token) => (
                    <option key={token.id} value={token.symbol}>{token.symbol}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="bg-transparent border-0 p-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setSendOpen(false)} className="border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80">
                Confirm Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-background border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Receive Assets</DialogTitle>
            <DialogDescription>
              Share this address to receive TPC and supported Tipschain assets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Wallet address</p>
              <p className="font-mono text-sm break-all">{walletAddress || 'Generating wallet address...'}</p>
            </div>
            <DialogFooter className="bg-transparent border-0 p-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => walletAddress && copyToClipboard(walletAddress, 'Receive address copied.')}
                className="border-white/10 hover:bg-white/5"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </Button>
              <Button type="button" onClick={handleViewHistory} className="bg-primary hover:bg-primary/80">
                <ExternalLink className="w-4 h-4" />
                Open in Explorer
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
