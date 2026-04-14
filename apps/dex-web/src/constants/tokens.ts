import { type Chain } from 'viem';

export const TIPSCHAIN: Chain = {
  id: 19251925,
  name: 'Tipschain',
  nativeCurrency: {
    name: 'Tipschain',
    symbol: 'TPC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['/rpc-tipschain'] },
    public: { http: ['/rpc-tipschain'] },
  },
  blockExplorers: {
    default: { name: 'Tipschain Explorer', url: 'https://scan.tipschain.online' },
  },
};

export const TOKENS = [
  {
    symbol: 'TPC',
    name: 'Tipschain',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native
    logo: 'input_file_4.png',
  },
  {
    symbol: 'wTPC',
    name: 'Wrapped Tipschain',
    decimals: 18,
    address: '0x1234...wTPC', // Placeholder
    logo: 'input_file_6.png',
  },
  {
    symbol: 'USDTC',
    name: 'USDTips',
    decimals: 18,
    address: '0x1234...USDTC', // Placeholder
    logo: 'input_file_5.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    address: '0x1234...USDT', // Placeholder
    logo: 'input_file_0.png',
  },
];

export const LINKS = {
  explorer: 'https://scan.tipschain.online',
  wallet: 'https://wallet.tipspay.org',
  dex: 'https://dex.tipspay.org',
};
