import React, { useState, useEffect } from 'react';

interface OptionParams {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number;
  riskFreeRate: number;
  volatility: number;
  optionType: 'call' | 'put';
  exerciseType: 'european' | 'american';
}

interface OptionResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

const OptionsPricer: React.FC = () => {
  const [params, setParams] = useState<OptionParams>({
    spotPrice: 100,
    strikePrice: 100,
    timeToExpiry: 0.25, // 3 months
    riskFreeRate: 0.05, // 5%
    volatility: 0.2, // 20%
    optionType: 'call',
    exerciseType: 'european',
  });

  const [result, setResult] = useState<OptionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Black-Scholes formula implementation
  const normalCDF = (x: number): number => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  const erf = (x: number): number => {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const calculateBlackScholes = (): OptionResult => {
    const { spotPrice: S, strikePrice: K, timeToExpiry: T, riskFreeRate: r, volatility: sigma, optionType } = params;

    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const Nd1 = normalCDF(d1);
    const Nd2 = normalCDF(d2);
    const Nmd1 = normalCDF(-d1);
    const Nmd2 = normalCDF(-d2);

    let price: number;
    let delta: number;

    if (optionType === 'call') {
      price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
      delta = Nd1;
    } else {
      price = K * Math.exp(-r * T) * Nmd2 - S * Nmd1;
      delta = -Nmd1;
    }

    // Greeks calculations
    const phi_d1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
    const gamma = phi_d1 / (S * sigma * Math.sqrt(T));
    const theta = optionType === 'call' 
      ? (-S * phi_d1 * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * Nd2) / 365
      : (-S * phi_d1 * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * Nmd2) / 365;
    const vega = S * phi_d1 * Math.sqrt(T) / 100;
    const rho = optionType === 'call'
      ? K * T * Math.exp(-r * T) * Nd2 / 100
      : -K * T * Math.exp(-r * T) * Nmd2 / 100;

    return { price, delta, gamma, theta, vega, rho };
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const result = calculateBlackScholes();
      setResult(result);
      setIsCalculating(false);
    }, 500);
  };

  useEffect(() => {
    handleCalculate();
  }, [params]);

  const handleParamChange = (key: keyof OptionParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Options Pricer</h1>
          <p className="text-white/70">Modèle Black-Scholes pour options européennes et américaines</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parameters Panel */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Paramètres</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type d'option</label>
                  <select
                    value={params.optionType}
                    onChange={(e) => handleParamChange('optionType', e.target.value)}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  >
                    <option value="call">Call</option>
                    <option value="put">Put</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Type d'exercice</label>
                  <select
                    value={params.exerciseType}
                    onChange={(e) => handleParamChange('exerciseType', e.target.value)}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  >
                    <option value="european">Européenne</option>
                    <option value="american">Américaine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prix spot (S)</label>
                <input
                  type="number"
                  value={params.spotPrice}
                  onChange={(e) => handleParamChange('spotPrice', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prix d'exercice (K)</label>
                <input
                  type="number"
                  value={params.strikePrice}
                  onChange={(e) => handleParamChange('strikePrice', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temps jusqu'à expiration (années)</label>
                <input
                  type="number"
                  value={params.timeToExpiry}
                  onChange={(e) => handleParamChange('timeToExpiry', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Taux sans risque (%)</label>
                <input
                  type="number"
                  value={params.riskFreeRate * 100}
                  onChange={(e) => handleParamChange('riskFreeRate', (parseFloat(e.target.value) || 0) / 100)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Volatilité (%)</label>
                <input
                  type="number"
                  value={params.volatility * 100}
                  onChange={(e) => handleParamChange('volatility', (parseFloat(e.target.value) || 0) / 100)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 focus:border-blue-400 outline-none"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Résultats</h2>
            
            {isCalculating ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded-lg border border-green-400/30">
                  <div className="text-2xl font-bold text-green-400">
                    Prix de l'option: {result.price.toFixed(4)} €
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Delta (Δ)</div>
                    <div className="text-lg font-semibold">{result.delta.toFixed(4)}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Gamma (Γ)</div>
                    <div className="text-lg font-semibold">{result.gamma.toFixed(6)}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Theta (Θ)</div>
                    <div className="text-lg font-semibold">{result.theta.toFixed(4)}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Vega (ν)</div>
                    <div className="text-lg font-semibold">{result.vega.toFixed(4)}</div>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg col-span-2">
                    <div className="text-sm text-white/70">Rho (ρ)</div>
                    <div className="text-lg font-semibold">{result.rho.toFixed(4)}</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
                  <h3 className="font-semibold mb-2">🥊 MMA Easter Egg</h3>
                  <p className="text-sm text-white/80">
                    "Precision beats power, timing beats speed!" - Conor McGregor
                    <br />
                    Comme en MMA, le pricing d'options demande précision et timing parfait! 🥊
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPricer;