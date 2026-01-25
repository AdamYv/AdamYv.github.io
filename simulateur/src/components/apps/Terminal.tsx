import React, { useState } from 'react';

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<string[]>([
    'adam@quant-dev:~$ welcome',
    'Bienvenue dans le Terminal macOS Simulator',
    'Tapez "help" pour voir les commandes disponibles',
    '',
  ]);
  const [currentInput, setCurrentInput] = useState('');

  const commands: Record<string, () => string[]> = {
    help: () => [
      'Commandes disponibles:',
      '  help     - Affiche cette aide',
      '  ls       - Liste les fichiers',
      '  pwd      - Affiche le répertoire courant',
      '  whoami   - Affiche l\'utilisateur courant',
      '  date     - Affiche la date et l\'heure',
      '  clear    - Efface l\'écran',
      '  cv       - Affiche le CV',
      '  mma      - Easter egg MMA 🥊',
      '  fortune  - Citation aléatoire',
      '',
    ],
    ls: () => [
      'Documents/    Pictures/     Music/',
      'Desktop/      Downloads/    Movies/',
      'Applications/ CV.sh*        .bashrc',
      '',
    ],
    pwd: () => ['/Users/adam', ''],
    whoami: () => ['adam', ''],
    date: () => [new Date().toString(), ''],
    clear: () => {
      setHistory(['adam@quant-dev:~$ ']);
      return [];
    },
    cv: () => [
      '📄 CV Adam Guemoune',
      '🎯 Quantitative Analyst | Software Engineer | FinTech Developer',
      '📧 adam.guemoune@proton.me',
      '🔗 LinkedIn: adam-g-b5b1a6208',
      '🐙 GitHub: AdamYV',
      '',
      'Utilisez l\'icône CV.sh sur le bureau pour voir le CV complet!',
      '',
    ],
    mma: () => [
      '🥊 MMA Easter Eggs:',
      '',
      '"Float like a butterfly, sting like a bee!" - Muhammad Ali',
      '"I\'m not surprised, motherf***ers!" - Nate Diaz',
      '"Precision beats power, timing beats speed!" - Conor McGregor',
      '"Be like water making its way through cracks." - Bruce Lee',
      '"Champions aren\'t made in gyms. Champions are made from something',
      'deep inside them - a desire, a dream, a vision." - Muhammad Ali',
      '',
      '🏆 Fun Fact: Ce système a été développé par un fan de MMA!',
      '',
    ],
    fortune: () => {
      const quotes = [
        '"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
        '"In the middle of difficulty lies opportunity." - Albert Einstein',
        '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
        '"The only way to do great work is to love what you do." - Steve Jobs',
        '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return [randomQuote, ''];
    },
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const newHistory = [...history, `adam@quant-dev:~$ ${cmd}`];
    
    if (commands[trimmedCmd]) {
      const output = commands[trimmedCmd]();
      setHistory([...newHistory, ...output]);
    } else if (trimmedCmd === '') {
      setHistory([...newHistory]);
    } else {
      setHistory([...newHistory, `bash: ${cmd}: command not found`, '']);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCurrentInput('');
    }
  };

  return (
    <div className="terminal h-full">
      <div className="mb-4">
        {history.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      
      <div className="flex items-center">
        <span className="terminal-prompt">adam@quant-dev:~$ </span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent border-none outline-none text-terminal-fg font-mono"
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default Terminal;