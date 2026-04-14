import { useState } from 'react';
import { Web3Provider } from './lib/web3-provider';
import { Navbar } from './components/Navbar';
import { SwapCard } from './components/SwapCard';
import { PoolCard } from './components/PoolCard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');

  return (
    <Web3Provider>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/20 blur-[120px] rounded-full animate-pulse delay-700" />
        
        <Navbar />

        <main className="relative z-10 pt-20">
          <div className="flex justify-center mt-8">
            <div className="glass p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveTab('swap')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'swap' 
                    ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Swap
              </button>
              <button
                onClick={() => setActiveTab('pool')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'pool' 
                    ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Pool
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'swap' ? <SwapCard /> : <PoolCard />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Links */}
        <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center gap-8 text-xs text-muted-foreground glass border-t border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="input_file_1.png" alt="Tipschain" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              <span className="font-bold text-neon-purple">TIPSCHAIN DEX v1.0.0</span>
            </div>
            <a href="https://scan.tipschain.online" target="_blank" rel="noreferrer" className="hover:text-neon-purple transition-colors">Explorer</a>
            <a href="https://wallet.tipspay.org" target="_blank" rel="noreferrer" className="hover:text-neon-purple transition-colors">Wallet</a>
            <a href="#" className="hover:text-neon-purple transition-colors">Docs</a>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}
