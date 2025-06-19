// src/App.jsx

import { useEffect, useRef, useState } from 'react'
import './index.css'

const TILE_SIZE = 20
const BOARD_WIDTH = 30
const BOARD_HEIGHT = 20
const SPEED = 150

const initialSnake = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
]

const fruitTypes = [
  { label: '👤', type: 'about' },
  { label: '💼', type: 'projects' },
  { label: '🧠', type: 'experience' },
  { label: '🍏', type: 'grow' },
  { label: '💀', type: 'shrink' },
]

function App() {
  const [snake, setSnake] = useState(initialSnake)
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [fruits, setFruits] = useState(generateFruits())
  const [obstacles, setObstacles] = useState(generateObstacles())
  const [screen, setScreen] = useState(null)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const gameRef = useRef(null)

  function generateFruits() {
    return fruitTypes.map((fruit) => ({
      ...fruit,
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT),
    }))
  }

  function generateObstacles() {
    const rocks = []
    for (let i = 0; i < 6; i++) {
      rocks.push({
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT),
        label: '🪨',
      })
    }
    return rocks
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key
      if (key === 'Escape') setScreen(null)
      if (screen || gameOver) return
      if (key === 'ArrowUp' && direction.y !== 1) setDirection({ x: 0, y: -1 })
      else if (key === 'ArrowDown' && direction.y !== -1) setDirection({ x: 0, y: 1 })
      else if (key === 'ArrowLeft' && direction.x !== 1) setDirection({ x: -1, y: 0 })
      else if (key === 'ArrowRight' && direction.x !== -1) setDirection({ x: 1, y: 0 })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [direction, screen, gameOver])

  useEffect(() => {
    if (screen || gameOver) {
      setPaused(true)
      return
    }
    setPaused(false)
    const interval = setInterval(() => {
      setSnake((prev) => moveSnake(prev, direction))
    }, SPEED)
    return () => clearInterval(interval)
  }, [direction, screen, gameOver])

  function moveSnake(snake, dir) {
    const newHead = {
      x: (snake[0].x + dir.x + BOARD_WIDTH) % BOARD_WIDTH,
      y: (snake[0].y + dir.y + BOARD_HEIGHT) % BOARD_HEIGHT,
    }

    if (obstacles.some((o) => o.x === newHead.x && o.y === newHead.y)) {
      setGameOver(true)
      return initialSnake
    }

    const fruit = fruits.find((f) => f.x === newHead.x && f.y === newHead.y)

    if (fruit) {
      if (['about', 'projects', 'experience'].includes(fruit.type)) {
        setScreen(fruit.type)
        setScore((prev) => prev + 1)
      } else if (fruit.type === 'grow') {
        setSnake([newHead, ...snake])
        setScore((prev) => prev + 2)
      } else if (fruit.type === 'shrink') {
        const newBody = [...snake.slice(0, -2)]
        setSnake(newBody.length >= 1 ? [newHead, ...newBody] : [newHead])
        setScore((prev) => Math.max(prev - 1, 0))
      }

      setFruits((prev) =>
        prev.map((f) =>
          f.type === fruit.type ? { ...f, x: randX(), y: randY() } : f
        )
      )
      return [newHead, ...snake.slice(0, -1)]
    }

    return [newHead, ...snake.slice(0, -1)]
  }

  const randX = () => Math.floor(Math.random() * BOARD_WIDTH)
  const randY = () => Math.floor(Math.random() * BOARD_HEIGHT)

  const restartGame = () => {
    setSnake(initialSnake)
    setDirection({ x: 1, y: 0 })
    setFruits(generateFruits())
    setObstacles(generateObstacles())
    setGameOver(false)
    setScreen(null)
    setScore(0)
  }

  const handleGameOverChoice = (type) => {
    setScreen(type)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-mono">
      <h1 className="text-2xl mb-2">🐍 Snake Basic Portfolio</h1>
      <p className="text-sm mb-1">Setas = mover | ESC = fechar</p>
      <div className="text-xs mb-2 text-center">
        <p>🍏 = Cresce | 💀 = Encolhe</p>
        <p>👤 = Sobre Mim | 💼 = Projetos | 🧠 = Experiência</p>
        <p>🪨 = Pedra (obstáculo)</p>
      </div>
      <div className="text-sm mb-2">Pontuação: {score}</div>
      <div
        ref={gameRef}
        className="relative bg-black border-4 border-green-500"
        style={{ width: TILE_SIZE * BOARD_WIDTH, height: TILE_SIZE * BOARD_HEIGHT }}
      >
        {snake.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: s.x * TILE_SIZE,
              top: s.y * TILE_SIZE,
              color: 'green',
            }}
          >
            🟩
          </div>
        ))}

        {fruits.map((f, i) => (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              left: f.x * TILE_SIZE,
              top: f.y * TILE_SIZE,
            }}
          >
            {f.label}
          </div>
        ))}

        {obstacles.map((o, i) => (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              left: o.x * TILE_SIZE,
              top: o.y * TILE_SIZE,
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
      <a
  href="https://github.com/TiagoAH"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 text-green-400 underline text-sm"
>
  github.com/TiagoAH
</a>

      {gameOver && !screen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black text-green-400 border border-green-500 rounded-lg p-6 w-96 font-mono text-center">
            <h2 className="text-2xl mb-4">💀 GAME OVER 💀</h2>
            <p className="mb-2">Pontuação final: {score}</p>
            <p className="mb-2">Escolhe uma opção:</p>
            <div className="flex justify-center space-x-4 text-3xl">
              <button onClick={() => handleGameOverChoice('about')}>👤</button>
              <button onClick={() => handleGameOverChoice('projects')}>💼</button>
              <button onClick={() => handleGameOverChoice('experience')}>🧠</button>
            </div>
            <button onClick={restartGame} className="mt-6 bg-green-600 px-4 py-2 rounded text-white">
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {screen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black text-green-400 border border-green-500 rounded-lg p-6 w-96 relative font-mono">
            <button
              onClick={() => setScreen(null)}
              className="absolute top-2 right-2 text-red-500 text-xl font-bold"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-2">
              {screen === 'about' && '🧑 Sobre Mim'}
              {screen === 'projects' && '💼 Projetos'}
              {screen === 'experience' && '🧠 Experiência'}
            </h2>
            <p className="text-sm mb-4">
              {screen === 'about' && 'Sou um programador criativo e apaixonado por tecnologia'}
              {screen === 'projects' && 'Ex: E-commerce MERN, Databases, Data Analytics e muito mais'}
              {screen === 'experience' && 'Estágios, freelance, projetos académicos, e muito mais'}
            </p>
            {gameOver && (
              <button onClick={() => setScreen(null)} className="text-green-400 underline">
                Voltar ao menu de fim de jogo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
