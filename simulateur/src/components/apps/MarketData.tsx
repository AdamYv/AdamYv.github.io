import React, { useState, useEffect } from 'react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  high52w: number;
  low52w: number;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time: string;
  impact: 'positive' | 'negative' | 'neutral';
}

const MarketData: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'markets' | 'news' | 'analysis'>('markets');
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF',
      price: 478.50,
      change: 2.30,
      changePercent: 0.48,
      volume: 45678900,
      marketCap: '445.2B',
      high52w: 485.20,
      low52w: 362.40,
    },
    {
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 398.75,
      change: -1.85,
      changePercent: -0.46,
      volume: 32456780,
      marketCap: '198.7B',
      high52w: 408.30,
      low52w: 287.50,
    },
    {
      symbol: 'IWM',
      name: 'iShares Russell 2000 ETF',
      price: 218.90,
      change: 0.95,
      changePercent: 0.44,
      volume: 18765432,
      marketCap: '32.1B',
      high52w: 235.80,
      low52w: 164.20,
    },
    {
      symbol: 'VIX',
      name: 'CBOE Volatility Index',
      price: 14.25,
      change: -0.75,
      changePercent: -5.00,
      volume: 0,
      marketCap: 'N/A',
      high52w: 65.20,
      low52w: 12.10,
    },
    {
      symbol: 'GLD',
      name: 'SPDR Gold Shares',
      price: 195.80,
      change: 1.20,
      changePercent: 0.62,
      volume: 8765432,
      marketCap: '72.4B',
      high52w: 205.50,
      low52w: 180.20,
    },
  ]);

  const [news, setNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: 'Fed maintient les taux d\'intérêt stables',
      summary: 'La Réserve fédérale américaine a décidé de maintenir ses taux directeurs inchangés lors de sa dernière réunion.',
      time: '2h',
      impact: 'neutral',
    },
    {
      id: 2,
      title: 'Les actions technologiques en hausse',
      summary: 'Le secteur technologique affiche une performance positive avec des gains significatifs pour les grandes capitalisations.',
      time: '4h',
      impact: 'positive',
    },
    {
      id: 3,
      title: 'Tensions géopolitiques affectent les marchés',
      summary: 'Les incertitudes géopolitiques continuent d\'influencer les décisions d\'investissement des traders institutionnels.',
      time: '6h',
      impact: 'negative',
    },
    {
      id: 4,
      title: 'Nouveau record pour l\'or',
      summary: 'Le prix de l\'or atteint de nouveaux sommets historiques dans un contexte d\'inflation persistante.',
      time: '8h',
      impact: 'positive',
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData => 
        prevData.map(item => {
          const randomChange = (Math.random() - 0.5) * 4; // -2 to 2
          const newPrice = Math.max(0.01, item.price + randomChange);
          const change = newPrice - item.price;
          const changePercent = (change / item.price) * 100;
          
          return {
            ...item,
            price: newPrice,
            change,
            changePercent,
            volume: item.volume + Math.floor(Math.random() * 100000),
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-blue-900/20 to-green-900/20 backdrop-blur-md overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📈 Market Data</h1>
          <p className="text-white/70">Données de marché en temps réel et actualités financières</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass p-1 rounded-xl">
            <div className="flex gap-1">
              {[
                { id: 'markets', label: 'Marchés', icon: '📊' },
                { id: 'news', label: 'Actualités', icon: '📰' },
                { id: 'analysis', label: 'Analyse', icon: '🔍' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-blue-500/30 border border-blue-400/50'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Markets Tab */}
        {selectedTab === 'markets' && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Indices et ETFs Principaux</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3">Symbole</th>
                    <th className="text-right p-3">Prix</th>
                    <th className="text-right p-3">Variation</th>
                    <th className="text-right p-3">Volume</th>
                    <th className="text-right p-3">Cap. Marché</th>
                    <th className="text-right p-3">52W High/Low</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((item) => (
                    <tr key={item.symbol} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <div>
                          <div className="font-semibold">{item.symbol}</div>
                          <div className="text-sm text-white/70">{item.name}</div>
                        </div>
                      </td>
                      <td className="text-right p-3 font-semibold">
                        {formatCurrency(item.price)}
                      </td>
                      <td className={`text-right p-3 ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div>{formatCurrency(item.change)}</div>
                        <div className="text-sm">{formatPercent(item.changePercent)}</div>
                      </td>
                      <td className="text-right p-3 text-white/70">
                        {item.volume > 0 ? formatVolume(item.volume) : 'N/A'}
                      </td>
                      <td className="text-right p-3 text-white/70">
                        {item.marketCap}
                      </td>
                      <td className="text-right p-3 text-sm text-white/70">
                        <div>{formatCurrency(item.high52w)}</div>
                        <div>{formatCurrency(item.low52w)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* News Tab */}
        {selectedTab === 'news' && (
          <div className="space-y-4">
            <div className="glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Actualités du Marché</h2>
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getImpactIcon(item.impact)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <span className={`text-sm ${getImpactColor(item.impact)}`}>
                            {item.impact}
                          </span>
                          <span className="text-sm text-white/50">• {item.time}</span>
                        </div>
                        <p className="text-white/80 text-sm">{item.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Analyse Technique</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Indicateurs Clés</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                      <span>RSI (14)</span>
                      <span className="text-yellow-400">65.2</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                      <span>MACD</span>
                      <span className="text-green-400">+0.85</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                      <span>Bollinger Bands</span>
                      <span className="text-blue-400">Neutre</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                      <span>Stochastic</span>
                      <span className="text-red-400">78.9</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Sentiment du Marché</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 rounded border border-green-400/30">
                      <div className="text-sm text-green-400 mb-1">Fear & Greed Index</div>
                      <div className="text-2xl font-bold">72</div>
                      <div className="text-sm text-white/70">Cupidité</div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded border border-blue-400/30">
                      <div className="text-sm text-blue-400 mb-1">VIX</div>
                      <div className="text-2xl font-bold">{marketData.find(item => item.symbol === 'VIX')?.price.toFixed(2)}</div>
                      <div className="text-sm text-white/70">Volatilité Faible</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MMA Easter Egg */}
            <div className="glass p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <h3 className="text-xl font-semibold mb-4">🥊 MMA Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Stratégies de Combat Financier</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• <strong>Jab & Cross:</strong> Diversification et hedging</li>
                    <li>• <strong>Guard Up:</strong> Stop-loss et gestion des risques</li>
                    <li>• <strong>Ground Game:</strong> Investissement long terme</li>
                    <li>• <strong>Knockout:</strong> Opportunités de swing trading</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Citation du Champion</h4>
                  <p className="text-sm text-white/80 italic">
                    "Everyone has a plan until they get punched in the mouth." - Mike Tyson
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    Comme en MMA, les marchés peuvent être imprévisibles. 
                    Restez flexible et adaptez votre stratégie! 🥊
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketData;