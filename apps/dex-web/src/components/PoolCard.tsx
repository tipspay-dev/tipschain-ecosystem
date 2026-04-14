import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Plus, Settings, Info, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function PoolCard() {
  return (
    <div className="w-full max-w-[640px] mx-auto pt-24 pb-12 px-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pools</h1>
          <p className="text-muted-foreground">Provide liquidity and earn fees.</p>
        </div>
        <Button className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> New Position
        </Button>
      </div>

      <Tabs defaultValue="v3" className="w-full">
        <TabsList className="glass border-white/10 mb-6 p-1 h-12 rounded-xl">
          <TabsTrigger value="v3" className="rounded-lg px-8 data-[state=active]:bg-neon-purple data-[state=active]:text-white">V3</TabsTrigger>
          <TabsTrigger value="v2" className="rounded-lg px-8 data-[state=active]:bg-neon-purple data-[state=active]:text-white">V2</TabsTrigger>
          <TabsTrigger value="v1" className="rounded-lg px-8 data-[state=active]:bg-neon-purple data-[state=active]:text-white">V1</TabsTrigger>
        </TabsList>

        <TabsContent value="v3" className="space-y-4">
          <Card className="glass border-white/10 overflow-hidden">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                <Info size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Your V3 positions will appear here.</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Connect your wallet to view your active liquidity positions.
                </p>
              </div>
              <Button variant="outline" className="neon-border-purple hover:bg-neon-purple/10 mt-4">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeaturedPool 
              pair="TPC / USDTC" 
              fee="0.3%" 
              tvl="$1.2M" 
              apr="12.5%" 
              color="purple"
            />
            <FeaturedPool 
              pair="TPC / USDT" 
              fee="0.05%" 
              tvl="$850K" 
              apr="8.2%" 
              color="blue"
            />
          </div>
        </TabsContent>

        <TabsContent value="v2">
          <Card className="glass border-white/10 p-8 text-center">
            <p className="text-muted-foreground">V2 Liquidity Pools are coming soon to Tipschain.</p>
          </Card>
        </TabsContent>

        <TabsContent value="v1">
          <Card className="glass border-white/10 p-8 text-center">
            <p className="text-muted-foreground">V1 Legacy Pools are maintained for compatibility.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeaturedPool({ pair, fee, tvl, apr, color }: { pair: string, fee: string, tvl: string, apr: string, color: 'purple' | 'blue' | 'green' }) {
  const colorMap = {
    purple: 'border-neon-purple/30 hover:border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    blue: 'border-neon-blue/30 hover:border-neon-blue shadow-[0_0_15px_rgba(96,165,250,0.1)]',
    green: 'border-neon-green/30 hover:border-neon-green shadow-[0_0_15px_rgba(74,222,128,0.1)]',
  };

  return (
    <Card className={`glass transition-all cursor-pointer group ${colorMap[color]}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{pair}</CardTitle>
          <Badge variant="outline" className="bg-white/5 border-white/10">{fee}</Badge>
        </div>
        <CardDescription>Concentrated Liquidity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">TVL</div>
            <div className="text-xl font-bold">{tvl}</div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">APR</div>
            <div className="text-xl font-bold text-neon-green">{apr}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
