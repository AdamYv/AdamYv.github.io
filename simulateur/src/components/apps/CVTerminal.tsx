import React, { useState, useEffect } from 'react';

const CVTerminal: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const cvContent = `
adam@quant-dev:~/cv$ cat resume.txt

╔══════════════════════════════════════════════════════════════════════════════╗
║                              ADAM GUEMOUNE                                   ║
║                  Quantitative Analyst | Software Engineer                   ║
║                            FinTech Developer                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

📧 adam.guemoune@proton.me  📍 Paris, France  📞 +33 (0)7 81 28 29 48
🔗 LinkedIn: adam-g-b5b1a6208  🐙 GitHub: AdamYV

═══════════════════════════════════════════════════════════════════════════════
🎯 MISSION PARAMETERS // Seeking Final Year Internship
═══════════════════════════════════════════════════════════════════════════════

Target Role:     IT Quantitative Analyst / Business Analyst / Support Engineer
Deployment Date: March 10, 2026
Duration:        6 Months
Mobility:        United Kingdom, Netherlands, Luxembourg

═══════════════════════════════════════════════════════════════════════════════
💻 SKILLS // Technical Stack
═══════════════════════════════════════════════════════════════════════════════

Programming Languages:
├── Python: Advanced
├── C# .NET: Advanced  
├── SQL: Advanced (PostgreSQL, MySQL)
├── C++: Foundational
└── Web: HTML, CSS, JavaScript, React.js (Advanced)

Python Ecosystem:
├── Pandas • NumPy • PyTorch • Scikit-learn
├── Matplotlib • Seaborn • yfinance
└── Django • pipenv

Quantitative Finance:
├── Financial Modeling • Quantitative Analysis
├── Algorithmic Trading • Backtesting
├── Risk Management • Asset Allocation
└── Portfolio Optimization

Financial Models:
├── Black-Scholes Model
├── Binomial Trees
├── Monte-Carlo Simulation
└── Lotka-Volterra Systems

═══════════════════════════════════════════════════════════════════════════════
🚀 PROJECTS // Executed_Projects
═══════════════════════════════════════════════════════════════════════════════

def Hierarchical_Clustering_Asset.py [2025]:
    role: ML / Quantitative Analyst
    description: Applied Agglomerative Clustering to classify asset classes,
                uncovering non-obvious correlations to enhance portfolio 
                diversification.
    env: Python 3.11, Pandas, NumPy, Matplotlib, Scikit-learn, yfinance

def PINN_Financial_System_Model.py [2025]:
    role: AI / Research Engineer  
    description: Engineered a Physics-Informed Neural Network (PINN) 
                integrating Lotka-Volterra equations to model complex 
                capital flows in banking systems.
    env: Python 3.11, PyTorch, Pandas, NumPy, Matplotlib

def Trading_Backtester_App.cs [2025]:
    role: C# .NET Developer
    description: Developed .NET WPF application to backtest trading 
                strategies using Alpha Vantage data, implementing key 
                metrics like ROI and Sharpe Ratio.
    env: C# 8, .NET 4.8, WPF, Git, Visual Studio 2022, Alpha Vantage API

def Options_Pricer_Tool.cs [2024]:
    role: C# .NET Developer
    description: Created C# .NET tool for pricing European, American, 
                and Asian options using Black-Scholes, Binomial Tree, 
                and Monte-Carlo models.
    env: C# 8, .NET 4.8, WPF, Git, Visual Studio 2022

═══════════════════════════════════════════════════════════════════════════════
💼 WORK EXPERIENCE // System_Logs  
═══════════════════════════════════════════════════════════════════════════════

Web Developer @ SARL ZNB [Jun 2025 – Nov 2025]
▸ Development and deployment of Python operational intelligence system
▸ Real-time inventory management and PostgreSQL performance optimization

═══════════════════════════════════════════════════════════════════════════════
🎓 EDUCATION // Initialization_Sequence
═══════════════════════════════════════════════════════════════════════════════

Engineering Degree in Computer Science – Major in IT for Finance
EFREI Paris, Paris, France [2022 – 2026 (Expected)]

Bachelor's in Computer Science (Exchange Program)  
VŠB – Technical University of Ostrava, Czech Republic [2023 – 2024]

═══════════════════════════════════════════════════════════════════════════════
🎯 INTERESTS // Config_Interests
═══════════════════════════════════════════════════════════════════════════════

Sports:          Running • Swimming • Cycling • Boxing enthusiast
Literature:      Financial news • Short stories • Novels • Philosophy  
Finance & Tech:  Algorithmic Trading • Open-Source FinTech Development
Gaming:          Old video games (3DS, Gameboy) • Hardware tinkering

adam@quant-dev:~/cv$ █
`.trim().split('\n');

  useEffect(() => {
    if (currentLineIndex < cvContent.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, cvContent[currentLineIndex]]);
        setCurrentLineIndex(prev => prev + 1);
      }, 50); // Typing speed

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, cvContent]);

  return (
    <div className="terminal">
      {lines.map((line, index) => (
        <div key={index} className="terminal-line">
          {line}
        </div>
      ))}
      {currentLineIndex < cvContent.length && (
        <div className="terminal-line animate-pulse">█</div>
      )}
    </div>
  );
};

export default CVTerminal;