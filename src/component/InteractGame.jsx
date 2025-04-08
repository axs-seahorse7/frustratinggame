import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const mazeSize = 10;
const cellSize = 40;
const timeLimit = 60;

const generateComplexMaze = (size) => {
  let maze = Array(size)
    .fill()
    .map(() => Array(size).fill(1));

  let x = 0,
    y = 0;
  maze[y][x] = 0;

  while (x < size - 1 || y < size - 1) {
    let direction = Math.random() > 0.5 ? "right" : "down";
    if (direction === "right" && x < size - 1) x++;
    else if (direction === "down" && y < size - 1) y++;
    maze[y][x] = 0;
  }
  maze[size - 1][size - 1] = 2;

  for (let i = 0; i < 3; i++) {
    let powerX = Math.floor(Math.random() * size);
    let powerY = Math.floor(Math.random() * size);
    if (maze[powerY][powerX] === 0) maze[powerY][powerX] = 3;
  }

  for (let i = 0; i < 2; i++) {
    let trapX = Math.floor(Math.random() * size);
    let trapY = Math.floor(Math.random() * size);
    if (maze[trapY][trapX] === 0) maze[trapY][trapX] = 4;
  }
  return maze;
};

export default function MazeGame() {
  const [maze, setMaze] = useState(generateComplexMaze(mazeSize));
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [level, setLevel] = useState(1);
  const [gameMessage, setGameMessage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameMessage("Time's up! Game Over.");
          resetGame(false);
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [level]);

  const resetGame = (newLevel) => {
    if (newLevel) {
      setLevel((prev) => prev + 1);
      setMaze(generateComplexMaze(mazeSize));
    }
    setPlayerPos({ x: 0, y: 0 });
    setTimeLeft(timeLimit);
    setGameMessage(null);
  };

  const movePlayer = (dx, dy) => {
    setPlayerPos((prev) => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      if (newX >= 0 && newY >= 0 && newX < mazeSize && newY < mazeSize) {
        if (maze[newY][newX] === 1) {
          setGameMessage("Game Over! You hit a black box.");
          resetGame(false);
          return { x: 0, y: 0 };
        }
        if (maze[newY][newX] === 2) {
          resetGame(true);
          return { x: 0, y: 0 };
        }
        if (maze[newY][newX] === 3) {
          setTimeLeft((prev) => prev + 10);
          setGameMessage("Power-up! +10 seconds");
        }
        if (maze[newY][newX] === 4) {
          setGameMessage("Trap! Teleporting...");
          return { x: Math.floor(Math.random() * mazeSize), y: Math.floor(Math.random() * mazeSize) };
        }
        return { x: newX, y: newY };
      }
      return prev;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-xl font-bold mb-4">Maze Game - Level {level}</h1>
      <p>Time Left: {timeLeft}s</p>
      {gameMessage && <div className="bg-white p-3 shadow-md mb-3">{gameMessage}</div>}
      <div
        className="relative bg-black border border-gray-500"
        style={{ width: mazeSize * cellSize, height: mazeSize * cellSize }}
      >
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="absolute border border-gray-700"
              style={{
                width: cellSize,
                height: cellSize,
                top: rowIndex * cellSize,
                left: colIndex * cellSize,
                backgroundColor: cell === 1 ? "black" : cell === 2 ? "gold" : cell === 3 ? "blue" : cell === 4 ? "red" : "white",
              }}
            ></div>
          ))
        )}
        <motion.div
          className="w-8 h-8 bg-blue-500 rounded-full absolute"
          animate={{ x: playerPos.x * cellSize, y: playerPos.y * cellSize }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          🏃
        </motion.div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="bg-gray-700 text-white p-2" onClick={() => movePlayer(0, -1)}><i className="ri-arrow-up-line"></i></button>
        <button className="bg-gray-700 text-white p-2" onClick={() => movePlayer(0, 1)}><i className="ri-arrow-down-line"></i></button>
        <button className="bg-gray-700 text-white p-2" onClick={() => movePlayer(-1, 0)}>Left</button>
        <button className="bg-gray-700 text-white p-2" onClick={() => movePlayer(1, 0)}><i className="ri-arrow-right-line"></i></button>
      </div>
    </div>
  );
}
