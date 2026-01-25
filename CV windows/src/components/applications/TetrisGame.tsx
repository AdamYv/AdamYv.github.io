import React, { useState, useEffect, useCallback } from 'react';

type TetrisBoard = number[][];
type TetrisPiece = {
  shape: number[][];
  x: number;
  y: number;
  color: number;
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETRIS_PIECES = [
  // I piece
  [
    [1, 1, 1, 1]
  ],
  // O piece
  [
    [1, 1],
    [1, 1]
  ],
  // T piece
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // S piece
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // Z piece
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  // J piece
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L piece
  [
    [0, 0, 1],
    [1, 1, 1]
  ]
];

export const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<TetrisBoard>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const createNewPiece = useCallback((): TetrisPiece => {
    const pieceIndex = Math.floor(Math.random() * TETRIS_PIECES.length);
    const shape = TETRIS_PIECES[pieceIndex];
    return {
      shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
      y: 0,
      color: pieceIndex + 1
    };
  }, []);

  const isValidPosition = useCallback((piece: TetrisPiece, board: TetrisBoard): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: TetrisPiece, board: TetrisBoard): TetrisBoard => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          if (newY >= 0) {
            newBoard[newY][newX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((board: TetrisBoard): { newBoard: TetrisBoard; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const rotatePiece = useCallback((piece: TetrisPiece): TetrisPiece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    
    return { ...piece, shape: rotated };
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver) return;
    
    const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    
    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else if (dy > 0) {
      // Piece hit bottom, place it
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      
      const nextPiece = createNewPiece();
      if (isValidPosition(nextPiece, clearedBoard)) {
        setCurrentPiece(nextPiece);
      } else {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [currentPiece, board, gameOver, isValidPosition, placePiece, clearLines, createNewPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gameOver, rotatePiece, isValidPosition]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(createNewPiece());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, movePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotate();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotate]);

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const newX = currentPiece.x + x;
            const newY = currentPiece.y + y;
            if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
              displayBoard[newY][newX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="tetris-game">
      <div className="tetris-score">
        Score: {score}
      </div>
      
      <div className="tetris-board">
        {displayBoard.flat().map((cell, index) => (
          <div
            key={index}
            className={`tetris-cell ${cell ? 'filled' : ''}`}
            style={{
              backgroundColor: cell ? `hsl(${cell * 60}, 70%, 50%)` : '#000'
            }}
          />
        ))}
      </div>
      
      <div className="tetris-controls">
        {!isPlaying && !gameOver && (
          <button 
            onClick={startGame}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
          >
            Démarrer
          </button>
        )}
        
        {isPlaying && (
          <button 
            onClick={pauseGame}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-2"
          >
            Pause
          </button>
        )}
        
        {gameOver && (
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Game Over!</div>
            <button 
              onClick={startGame}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Rejouer
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm">
          <div>Contrôles:</div>
          <div>← → : Déplacer</div>
          <div>↓ : Descendre</div>
          <div>↑ / Espace : Rotation</div>
        </div>
      </div>
    </div>
  );
};