import React, { useState, useEffect } from 'react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity: number;
  value: number;
}

interface PortfolioStats {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

const PortfolioManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 195.50,
      change: 2.30,
      changePercent: 1.19,
      quantity: 10,
      value: 1955.00,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 378.85,
      change: -1.25,
      changePercent: -0.33,
      quantity: 5,
      value: 1894.25,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.80,
      change: 0.95,
      changePercent: 0.67,
      quantity: 8,
      value: 1142.40,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.50,
      change: -5.20,
      changePercent: -2.05,
      quantity: 3,
      value: 745.50,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 495.20,
      change: 12.80,
      changePercent: 2.65,
      quantity: 2,
      value: 990.40,
    },
  ]);

  const [newAsset, setNewAsset] = useState({
    symbol: '',
    quantity: 0,
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate portfolio statistics
  const calculateStats = (): PortfolioStats => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const dayChange = assets.reduce((sum, asset) => sum + (asset.change * asset.quantity), 0);
    const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

    return {
      totalValue,
      totalGainLoss: 0, // Simplified for demo
      totalGainLossPercent: 0,
      dayChange,
      dayChangePercent,
    };
  };

  const stats = calculateStats();

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
          const newPrice = Math.max(0.01, asset.price + randomChange);
          const change = newPrice - asset.price;
          const changePercent = (change / asset.price) * 100;
          
          return {
            ...asset,
            price: newPrice,
            change,
            changePercent,
            value: newPrice * asset.quantity,
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddAsset = () => {
    if (newAsset.symbol && newAsset.quantity > 0) {
      // Simulate fetching asset data
      const mockPrice = Math.random() * 200 + 50;
      const mockChange = (Math.random() - 0.5) * 10;
      
      const asset: Asset = {
        symbol: newAsset.symbol.toUpperCase(),
        name: `${newAsset.symbol.toUpperCase()} Corp.`,
        price: mockPrice,
        change: mockChange,
        changePercent: (mockChange / mockPrice) * 100,
        quantity: newAsset.quantity,
        value: mockPrice * newAsset.quantity,
      };

      setAssets(prev => [...prev, asset]);
      setNewAsset({ symbol: '', quantity: 0 });
      setShowAddForm(false);
    }
  };

  const handleRemoveAsset = (symbol: string) => {
    setAssets(prev => prev.filter(asset => asset.symbol !== symbol));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-green-900/20 to-blue-900/20 backdrop-blur-md overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">💼 Portfolio Manager</h1>
          <p className="text-white/70">Gestionnaire de portefeuille en temps réel</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-4 rounded-xl">
            <div className="text-sm text-white/70">Valeur totale</div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.totalValue)}
            </div>
          </div>
          
          <div className="glass p-4 rounded-xl">
            <div className="text-sm text-white/70">Variation du jour</div>
            <div className={`text-2xl font-bold ${stats.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.dayChange)}
            </div>
          </div>
          
          <div className="glass p-4 rounded-xl">
            <div className="text-sm text-white/70">% du jour</div>
            <div className={`text-2xl font-bold ${stats.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(stats.dayChangePercent)}
            </div>
          </div>
          
          <div className="glass p-4 rounded-xl">
            <div className="text-sm text-white/70">Nombre d'actifs</div>
            <div className="text-2xl font-bold text-blue-400">
              {assets.length}
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="glass p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes Actifs</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded border border-blue-400/50 transition-colors"
            >
              + Ajouter un actif
            </button>
          </div>

          {/* Add Asset Form */}
          {showAddForm && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Symbole (ex: AAPL)"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, symbol: e.target.value }))}
                  className="p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                />
                <input
                  type="number"
                  placeholder="Quantité"
                  value={newAsset.quantity || ''}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                />
                <button
                  onClick={handleAddAsset}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded border border-green-400/50 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {/* Assets List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3">Actif</th>
                  <th className="text-right p-3">Prix</th>
                  <th className="text-right p-3">Variation</th>
                  <th className="text-right p-3">Quantité</th>
                  <th className="text-right p-3">Valeur</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.symbol} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <div>
                        <div className="font-semibold">{asset.symbol}</div>
                        <div className="text-sm text-white/70">{asset.name}</div>
                      </div>
                    </td>
                    <td className="text-right p-3">
                      {formatCurrency(asset.price)}
                    </td>
                    <td className={`text-right p-3 ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div>{formatCurrency(asset.change)}</div>
                      <div className="text-sm">{formatPercent(asset.changePercent)}</div>
                    </td>
                    <td className="text-right p-3">
                      {asset.quantity}
                    </td>
                    <td className="text-right p-3 font-semibold">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="text-center p-3">
                      <button
                        onClick={() => handleRemoveAsset(asset.symbol)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-400/50 transition-colors text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MMA Easter Egg */}
        <div className="glass p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <h3 className="text-xl font-semibold mb-4">🥊 MMA Trading Corner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Citations de Champions</h4>
              <p className="text-sm text-white/80 mb-2">
                "I'm not in this sport to take punishment. I'm in this sport to give punishment!" - Conor McGregor
              </p>
              <p className="text-sm text-white/80">
                Comme en MMA, le trading demande discipline, stratégie et gestion des risques! 🥊
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Règles du Champion Trader</h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Diversifiez comme un combattant polyvalent</li>
                <li>• Gérez vos risques comme votre garde</li>
                <li>• Restez discipliné dans votre stratégie</li>
                <li>• Apprenez de chaque trade comme de chaque combat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioManager;