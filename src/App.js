import React from "react";
import GameCanvas from "./components/GameCanvas";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
      <header className="text-center mb-6 drop-shadow-xl">
        <h1
          className="text-3xl md:text-4xl font-extrabold text-yellow-400 tracking-wider mb-1 animate-pulse"
          style={{ textShadow: "2px 2px 8px #000" }}
        >
          Flappy Bird
        </h1>
        <p className="text-base text-teal-300 font-semibold tracking-wide">
          React Edition
        </p>
      </header>

      <main className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <div className="flex items-center justify-center">
          <GameCanvas />
        </div>
        <div className="max-w-sm w-full text-center lg:text-left bg-gray-800 bg-opacity-80 rounded-2xl shadow-2xl border-2 border-yellow-400 p-4 backdrop-blur-md">
          <h2 className="text-lg font-bold mb-2 text-teal-300">How to Play</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Click the screen or press the{" "}
            <span className="font-bold text-yellow-400">SPACEBAR</span> to make
            the bird flap.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed mt-1">
            Navigate through the gaps in the pipes to score points. Don't hit
            the pipes or the ground!
          </p>
        </div>
      </main>

      <footer className="text-center mt-8 text-gray-500 text-[11px]">
        <p>
          Built with <span className="text-yellow-400 font-bold">React</span>,{" "}
          <span className="text-teal-300 font-bold">Tailwind CSS</span>, and{" "}
          <span className="text-pink-400 font-bold">Tone.js</span>
        </p>
        <p className="mt-1 italic text-teal-400">A Gemini Creation</p>
      </footer>
    </div>
  );
}

export default App;
