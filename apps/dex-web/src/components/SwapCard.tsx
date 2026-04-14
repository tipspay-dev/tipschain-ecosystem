import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { TOKENS } from '../constants/tokens';
import { ArrowDown, Settings, Info, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

export function SwapCard() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isConfirming, setIsConfirming] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({
    'TPC': 0.10,
    'wTPC': 0.10,
    'USDTC': 1.00,
    'USDT': 1.00,
  });

  // Simulate real-time price updates for stables
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenPrices(prev => ({
        ...prev,
        'USDTC': 0.9 + Math.random() * 0.2, // 0.9 to 1.1
        'USDT': 0.9 + Math.random() * 0.2,   // 0.9 to 1.1
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock balances
  const balances = useMemo(() => ({
    [TOKENS[0].symbol]: '125.40',
    [TOKENS[1].symbol]: '0.00',
    [TOKENS[2].symbol]: '1000.00',
    [TOKENS[3].symbol]: '50.25',
  }), []);

  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    if (!val || isNaN(parseFloat(val))) {
      setToAmount('');
      return;
    }
    const fromPrice = tokenPrices[fromToken.symbol] || 0;
    const toPrice = tokenPrices[toToken.symbol] || 0;
    if (toPrice > 0) {
      const calculatedTo = (parseFloat(val) * fromPrice) / toPrice;
      setToAmount(calculatedTo.toFixed(6));
    }
  };

  const handleToAmountChange = (val: string) => {
    setToAmount(val);
    if (!val || isNaN(parseFloat(val))) {
      setFromAmount('');
      return;
    }
    const fromPrice = tokenPrices[fromToken.symbol] || 0;
    const toPrice = tokenPrices[toToken.symbol] || 0;
    if (fromPrice > 0) {
      const calculatedFrom = (parseFloat(val) * toPrice) / fromPrice;
      setFromAmount(calculatedFrom.toFixed(6));
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempToken);
    setToAmount(tempAmount);
  };

  const fromUSDValue = useMemo(() => {
    const amount = parseFloat(fromAmount);
    return isNaN(amount) ? '0.00' : (amount * (tokenPrices[fromToken.symbol] || 0)).toFixed(2);
  }, [fromAmount, fromToken, tokenPrices]);

  const toUSDValue = useMemo(() => {
    const amount = parseFloat(toAmount);
    return isNaN(amount) ? '0.00' : (amount * (tokenPrices[toToken.symbol] || 0)).toFixed(2);
  }, [toAmount, toToken, tokenPrices]);

  const isSwapDisabled = !fromAmount || parseFloat(fromAmount) <= 0 || !toAmount || parseFloat(toAmount) <= 0;

  return (
    <div className="w-full max-w-[480px] mx-auto pt-24 pb-12 px-4">
      <Card className="glass border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green" />
        
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">Swap</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <Settings size={18} />
                  </Button>
                }
              />
              <DialogContent className="glass border-white/10 sm:max-w-[360px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Slippage Tolerance</span>
                      <span className="text-xs text-muted-foreground">Auto</span>
                    </div>
                    <div className="flex gap-2">
                      {['0.1', '0.5', '1.0'].map((val) => (
                        <Button
                          key={val}
                          variant={slippage === val ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSlippage(val)}
                          className={`flex-1 rounded-xl ${slippage === val ? 'bg-neon-purple' : 'glass border-white/10'}`}
                        >
                          {val}%
                        </Button>
                      ))}
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="h-8 rounded-xl bg-white/5 border-white/10 pr-6 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* From Token */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">You pay</span>
            </div>
            <div className="flex gap-4 items-center">
              <Input 
                type="number" 
                placeholder="0" 
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="border-none bg-transparent text-2xl font-bold p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
              <TokenSelector selectedToken={fromToken} onSelect={(token) => {
                setFromToken(token);
                // Recalculate toAmount
                const fromPrice = tokenPrices[token.symbol] || 0;
                const toPrice = tokenPrices[toToken.symbol] || 0;
                if (fromAmount && toPrice > 0) {
                  setToAmount(((parseFloat(fromAmount) * fromPrice) / toPrice).toFixed(6));
                }
              }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">${fromUSDValue}</span>
              <span className="text-xs text-muted-foreground">Balance: {balances[fromToken.symbol as keyof typeof balances] || '0.00'}</span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-4 relative z-10">
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleSwapTokens}
              className="rounded-xl glass border-white/20 hover:border-neon-purple transition-all group"
            >
              <ArrowDown size={18} className="group-hover:text-neon-purple transition-colors" />
            </Button>
          </div>

          {/* To Token */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">You receive</span>
            </div>
            <div className="flex gap-4 items-center">
              <Input 
                type="number" 
                placeholder="0" 
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                className="border-none bg-transparent text-2xl font-bold p-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
              <TokenSelector selectedToken={toToken} onSelect={(token) => {
                setToToken(token);
                // Recalculate fromAmount
                const fromPrice = tokenPrices[fromToken.symbol] || 0;
                const toPrice = tokenPrices[token.symbol] || 0;
                if (toAmount && fromPrice > 0) {
                  setFromAmount(((parseFloat(toAmount) * toPrice) / fromPrice).toFixed(6));
                }
              }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">${toUSDValue}</span>
              <span className="text-xs text-muted-foreground">Balance: {balances[toToken.symbol as keyof typeof balances] || '0.00'}</span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                Price Impact <Info size={12} />
              </div>
              <span className="text-neon-green font-medium">0.05%</span>
            </div>
            <div className="flex justify-between items-center text-xs px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                Network Fee <Info size={12} />
              </div>
              <span className="text-muted-foreground">~$0.12</span>
            </div>
            <div className="flex justify-between items-center text-xs px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                Estimated Gas <Info size={12} />
              </div>
              <span className="text-muted-foreground">~$0.50</span>
            </div>

            <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
              <DialogTrigger
                render={
                  <Button 
                    disabled={isSwapDisabled}
                    className={`w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-2 rounded-2xl transition-all ${
                      isSwapDisabled 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                        : 'bg-neon-purple hover:bg-neon-purple/80 text-white'
                    }`}
                  >
                    {isSwapDisabled ? 'Enter an amount' : 'Swap'}
                  </Button>
                }
              />
              <DialogContent className="glass border-white/10 sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Confirm Swap</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 w-full justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <img src={fromToken.logo} alt={fromToken.symbol} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xl font-bold">{fromAmount} {fromToken.symbol}</span>
                      </div>
                    </div>
                    
                    <div className="bg-neon-purple/20 p-2 rounded-full">
                      <ArrowDown size={20} className="text-neon-purple" />
                    </div>

                    <div className="flex items-center gap-4 w-full justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <img src={toToken.logo} alt={toToken.symbol} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-xl font-bold">{toAmount} {toToken.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slippage Tolerance</span>
                      <span className="font-medium text-neon-purple">{slippage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price Impact</span>
                      <span className="font-medium text-neon-green">0.05%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-medium">~$0.12</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setIsConfirming(false);
                      setFromAmount('');
                      setToAmount('');
                      // In a real app, this would trigger the transaction
                    }}
                    className="w-full h-14 text-lg font-bold bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-2xl"
                  >
                    Confirm Swap
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TokenSelector({ selectedToken, onSelect }: { selectedToken: any, onSelect: (token: any) => void }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="glass border-white/10 rounded-full pl-2 pr-3 py-1 h-12 gap-3 hover:border-neon-purple transition-all shadow-lg hover:shadow-neon-purple/20"
          >
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
              <img
                src={selectedToken.logo}
                alt={selectedToken.symbol}
                className="w-full h-full object-cover scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-lg">{selectedToken.symbol}</span>
            <ChevronDown size={18} className="text-muted-foreground" />
          </Button>
        }
      />
      <DialogContent className="glass border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input placeholder="Search name or paste address" className="bg-white/5 border-white/10 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            {TOKENS.slice(0, 4).map((token) => (
              <Button 
                key={token.symbol} 
                variant="outline" 
                size="sm" 
                onClick={() => onSelect(token)}
                className="glass border-white/10 rounded-full gap-2 hover:border-neon-purple"
              >
                <div className="w-6 h-6 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                {token.symbol}
              </Button>
            ))}
          </div>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1">
              {TOKENS.map((token) => (
                <button
                  key={token.address}
                  onClick={() => onSelect(token)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-neon-purple/50 transition-colors shadow-inner">
                      <img src={token.logo} alt={token.symbol} className="w-full h-full object-cover scale-110" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold group-hover:text-neon-purple transition-colors">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">0</div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
