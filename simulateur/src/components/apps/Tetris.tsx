import React, { useState, useEffect, useCallback } from 'react';

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
};

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetris-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const createRandomPiece = (): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = types[Math.floor(Math.random() * types.length)];
    const template = TETROMINOS[type];
    
    return {
      type,
      shape: template.shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(template.shape[0].length / 2),
      y: 0,
      color: template.color,
    };
  };

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = (piece: Tetromino, board: string[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: Tetromino, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  };

  const clearLines = (board: string[][]): { newBoard: string[][]; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => !cell));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }
    
    return { newBoard, linesCleared };
  };

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    if (isValidPosition(currentPiece, board, 0, 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      // Place piece and check for lines
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level + 10);
      
      // Check game over
      if (currentPiece.y <= 0) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('tetris-high-score', score.toString());
        }
        return;
      }
      
      // Spawn next piece
      setCurrentPiece(nextPiece);
      setNextPiece(createRandomPiece());
    }
  }, [currentPiece, board, gameOver, isPaused, level, score, highScore, nextPiece]);

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;
    
    if (isValidPosition(currentPiece, board, dx, dy)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : null);
    }
  };

  const rotatePieceHandler = () => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(rotated, board)) {
      setCurrentPiece(rotated);
    }
  };

  const hardDrop = () => {
    if (!currentPiece || gameOver || isPaused) return;
    
    let newY = currentPiece.y;
    while (isValidPosition(currentPiece, board, 0, newY - currentPiece.y + 1)) {
      newY++;
    }
    setCurrentPiece(prev => prev ? { ...prev, y: newY } : null);
  };

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setCurrentPiece(createRandomPiece());
    setNextPiece(createRandomPiece());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  };

  // Initialize game
  useEffect(() => {
    if (!currentPiece && !nextPiece) {
      setCurrentPiece(createRandomPiece());
      setNextPiece(createRandomPiece());
    }
  }, [currentPiece, nextPiece]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      dropPiece();
    }, Math.max(50, 500 - (level - 1) * 50));

    return () => clearInterval(interval);
  }, [dropPiece, level]);

  // Level up
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1);
  }, [lines]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePieceHandler();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, board, gameOver, isPaused]);

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="h-full p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">🎮 Tetris</h1>
          <p className="text-white/70">Utilisez les flèches pour jouer, Espace pour drop, P pour pause</p>
        </div>

        <div className="flex justify-center gap-8">
          {/* Game Board */}
          <div className="glass p-4 rounded-xl">
            <div className="grid grid-cols-10 gap-px bg-white/10 p-2 rounded">
              {displayBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="w-6 h-6 border border-white/20"
                    style={{
                      backgroundColor: cell || 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Score */}
            <div className="glass p-4 rounded-xl w-48">
              <h3 className="font-semibold mb-2">Score</h3>
              <div className="text-2xl font-bold text-green-400">{score.toLocaleString()}</div>
              <div className="text-sm text-white/70 mt-1">Record: {highScore.toLocaleString()}</div>
            </div>

            {/* Stats */}
            <div className="glass p-4 rounded-xl w-48">
              <h3 className="font-semibold mb-2">Statistiques</h3>
              <div className="space-y-1 text-sm">
                <div>Niveau: {level}</div>
                <div>Lignes: {lines}</div>
              </div>
            </div>

            {/* Next Piece */}
            <div className="glass p-4 rounded-xl w-48">
              <h3 className="font-semibold mb-2">Suivant</h3>
              <div className="grid grid-cols-4 gap-px bg-white/10 p-2 rounded">
                {Array(4).fill(null).map((_, y) =>
                  Array(4).fill(null).map((_, x) => {
                    const inShape = nextPiece && 
                      y < nextPiece.shape.length && 
                      x < nextPiece.shape[y].length && 
                      nextPiece.shape[y][x];
                    
                    return (
                      <div
                        key={`${y}-${x}`}
                        className="w-4 h-4 border border-white/20"
                        style={{
                          backgroundColor: inShape ? nextPiece?.color : 'rgba(255, 255, 255, 0.05)',
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="glass p-4 rounded-xl w-48">
              <h3 className="font-semibold mb-2">Contrôles</h3>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-full mb-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded border border-blue-400/50 transition-colors"
              >
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button
                onClick={resetGame}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-400/50 transition-colors"
              >
                Nouveau jeu
              </button>
            </div>

            {/* MMA Easter Egg */}
            <div className="glass p-4 rounded-xl w-48 bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <h3 className="font-semibold mb-2">🥊 MMA Corner</h3>
              <p className="text-xs text-white/80">
                "Champions keep playing until they get it right!" - Billie Jean King
                <br /><br />
                Comme en MMA, Tetris demande réflexes et stratégie! 🥊
              </p>
            </div>
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass p-8 rounded-xl text-center">
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <div className="text-xl mb-2">Score final: {score.toLocaleString()}</div>
              {score > highScore && (
                <div className="text-lg text-yellow-400 mb-4">🏆 Nouveau record!</div>
              )}
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded border border-blue-400/50 transition-colors"
              >
                Rejouer
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass p-8 rounded-xl text-center">
              <h2 className="text-3xl font-bold mb-4">Pause</h2>
              <p className="mb-4">Appuyez sur P ou cliquez sur Reprendre</p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded border border-blue-400/50 transition-colors"
              >
                Reprendre
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tetris;