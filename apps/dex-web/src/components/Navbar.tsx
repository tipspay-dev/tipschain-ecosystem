import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from './ui/button';
import { LINKS } from '../constants/tokens';
import { Wallet, ExternalLink, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="input_file_2.png" alt="TipspayDEX" className="h-10 w-auto" referrerPolicy="no-referrer" />
            <span className="text-xl font-bold tracking-tighter hidden sm:block">
              TIPS<span className="text-neon-purple">DEX</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-neon-purple transition-colors">Swap</a>
            <a href="#" className="text-sm font-medium hover:text-neon-purple transition-colors">Pools</a>
            <a href={LINKS.explorer} target="_blank" rel="noreferrer" className="text-sm font-medium flex items-center gap-1 hover:text-neon-purple transition-colors">
              Explorer <ExternalLink size={14} />
            </a>
            <a href={LINKS.wallet} target="_blank" rel="noreferrer" className="text-sm font-medium flex items-center gap-2 hover:text-neon-purple transition-colors">
              <Wallet size={14} />
              Wallet <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Connected</span>
                <span className="text-xs font-mono">{truncatedAddress}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => disconnect()}
                className="neon-border-purple hover:bg-neon-purple/10"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => connect({ connector: injected() })}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          )}

          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass mt-3 rounded-2xl overflow-hidden border border-white/10"
          >
            <div className="flex flex-col p-4 gap-4">
              <a href="#" className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg">Swap</a>
              <a href="#" className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg">Pools</a>
              <a href={LINKS.explorer} target="_blank" rel="noreferrer" className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg flex items-center justify-between">
                Explorer <ExternalLink size={18} />
              </a>
              <a href={LINKS.wallet} target="_blank" rel="noreferrer" className="text-lg font-medium p-2 hover:bg-white/5 rounded-lg flex items-center justify-between">
                Wallet <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
