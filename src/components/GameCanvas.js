import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const game = useRef({
    bird: null,
    pipes: [],
    clouds: [],
    frameCount: 0,
    gameState: "start", // 'start', 'playing', 'gameOver'
  }).current;

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // Ref to hold score for game logic

  const [highScore, setHighScore] = useState(0);
  const highScoreRef = useRef(0); // Ref to hold high score for game logic

  const sounds = useRef(null);
  const soundInitialized = useRef(false);

  useEffect(() => {
    sounds.current = {
      flap: new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
      }).toDestination(),
      score: new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
      }).toDestination(),
      hit: new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
      }).toDestination(),
    };
  }, []);

  useEffect(() => {
    const storedHighScore = parseInt(
      localStorage.getItem("flappyBirdHighScoreReact") || 0,
      10
    );
    setHighScore(storedHighScore);
    highScoreRef.current = storedHighScore;
  }, []);

  const playSound = (sound) => {
    if (!soundInitialized.current) return;
    try {
      if (sound === "flap")
        sounds.current.flap.triggerAttackRelease("C5", "8n");
      if (sound === "score")
        sounds.current.score.triggerAttackRelease("E6", "8n");
      if (sound === "hit") sounds.current.hit.triggerAttackRelease("C4", "4n");
    } catch (error) {
      console.error("Tone.js error:", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scale = 2;
    canvas.width = 320 * scale;
    canvas.height = 480 * scale;
    ctx.scale(scale, scale);

    const gravity = 0.25;
    const lift = -6;
    const birdSize = 20;
    const pipeWidth = 50;
    const pipeGap = 120;

    class Bird {
      constructor() {
        this.x = 60;
        this.y = 240;
        this.velocity = 0;
      }
      update() {
        this.velocity += gravity;
        this.y += this.velocity;
        if (this.y < 0) {
          this.y = 0;
          this.velocity = 0;
        }
      }
      draw() {
        ctx.fillStyle = "#ffc700";
        ctx.beginPath();
        ctx.arc(this.x, this.y, birdSize / 2, 0, Math.PI * 2);
        ctx.fill();
        const wingAngle = Math.sin(game.frameCount * 0.3) * 0.4 - 0.2;
        ctx.save();
        ctx.translate(this.x - 5, this.y);
        ctx.rotate(wingAngle);
        ctx.fillStyle = "#ffde59";
        ctx.fillRect(0, -birdSize / 4, birdSize / 2, birdSize / 2);
        ctx.restore();
      }
      flap() {
        this.velocity = lift;
        playSound("flap");
      }
      hitsGround() {
        return this.y + birdSize / 2 > 480 - 20;
      }
    }

    class Pipe {
      constructor() {
        this.x = 320;
        this.topHeight = Math.random() * (240 - pipeGap) + 40;
        this.bottomHeight = 480 - this.topHeight - pipeGap;
        this.passed = false;
      }
      update() {
        this.x -= 2;
      }
      draw() {
        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(this.x, 0, pipeWidth, this.topHeight);
        ctx.fillRect(
          this.x,
          480 - this.bottomHeight,
          pipeWidth,
          this.bottomHeight
        );
      }
      hits(bird) {
        if (
          bird.x + birdSize / 2 > this.x &&
          bird.x - birdSize / 2 < this.x + pipeWidth
        ) {
          if (
            bird.y - birdSize / 2 < this.topHeight ||
            bird.y + birdSize / 2 > 480 - this.bottomHeight
          )
            return true;
        }
        return false;
      }
    }

    class Cloud {
      constructor() {
        this.x = Math.random() * 320;
        this.y = Math.random() * 380;
        this.size = Math.random() * 20 + 20;
        this.speed = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x -= this.speed;
        if (this.x + this.size < 0) {
          this.x = 320 + this.size;
          this.y = Math.random() * 380;
        }
      }
      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.arc(
          this.x + this.size * 0.6,
          this.y + this.size * 0.4,
          this.size * 0.8,
          0,
          Math.PI * 2
        );
        ctx.arc(
          this.x - this.size * 0.6,
          this.y + this.size * 0.3,
          this.size * 0.7,
          0,
          Math.PI * 2
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    const setup = () => {
      game.gameState = "start";
      game.bird = new Bird();
      game.pipes = [];
      game.clouds = [new Cloud(), new Cloud(), new Cloud()];
      game.frameCount = 0;
      setScore(0);
      scoreRef.current = 0;
    };

    const update = () => {
      game.bird.update();
      game.clouds.forEach((c) => c.update());
      if (game.bird.hitsGround() || game.pipes.some((p) => p.hits(game.bird))) {
        playSound("hit");
        game.gameState = "gameOver";
        if (scoreRef.current > highScoreRef.current) {
          const newHighScore = scoreRef.current;
          highScoreRef.current = newHighScore;
          setHighScore(newHighScore);
          localStorage.setItem("flappyBirdHighScoreReact", newHighScore);
        }
        return;
      }
      if (game.frameCount % 100 === 0) game.pipes.push(new Pipe());
      game.pipes.forEach((p) => {
        p.update();
        if (!p.passed && p.x + pipeWidth < game.bird.x) {
          p.passed = true;
          const newScore = scoreRef.current + 1;
          scoreRef.current = newScore;
          setScore(newScore);
          playSound("score");
        }
      });
      game.pipes = game.pipes.filter((p) => p.x + pipeWidth > 0);
      game.frameCount++;
    };

    const draw = () => {
      ctx.fillStyle = "#70c5ce";
      ctx.fillRect(0, 0, 320, 480);
      game.clouds.forEach((c) => c.draw());
      game.pipes.forEach((p) => p.draw());
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, 480 - 20, 320, 20);
      game.bird.draw();
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";

      if (game.gameState === "start") {
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillText("Click to Start", 160, 220);
        ctx.strokeText("Click to Start", 160, 220);
      } else if (game.gameState === "playing") {
        ctx.font = "36px 'Press Start 2P'";
        ctx.fillText(scoreRef.current, 160, 50);
        ctx.strokeText(scoreRef.current, 160, 50);
      } else if (game.gameState === "gameOver") {
        ctx.font = "24px 'Press Start 2P'";
        ctx.fillText("Game Over", 160, 200);
        ctx.strokeText("Game Over", 160, 200);
        ctx.font = "18px 'Press Start 2P'";
        ctx.fillText(`Score: ${scoreRef.current}`, 160, 240);
        ctx.strokeText(`Score: ${scoreRef.current}`, 160, 240);
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText("Click to Restart", 160, 280);
        ctx.strokeText("Click to Restart", 160, 280);
      }
    };

    let animationFrameId;
    const gameLoop = () => {
      if (game.gameState === "playing") update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleInput = () => {
      if (!soundInitialized.current) {
        Tone.start();
        soundInitialized.current = true;
      }
      if (game.gameState === "playing") game.bird.flap();
      else if (game.gameState === "gameOver") {
        setup();
        game.gameState = "playing";
      } else if (game.gameState === "start") game.gameState = "playing";
    };

    canvas.addEventListener("mousedown", handleInput);
    const keydownHandler = (e) => {
      if (e.code === "Space") handleInput();
    };
    window.addEventListener("keydown", keydownHandler);

    setup();
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleInput);
      window.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex justify-between items-center w-full max-w-lg mb-2 text-sm">
        <span>
          SCORE: <span className="text-yellow-400">{score}</span>
        </span>
        <span>
          HI-SCORE: <span className="text-yellow-400">{highScore}</span>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "70vh", maxWidth: 640, maxHeight: 960 }}
        className="rounded-md shadow-2xl border-2 border-gray-600"
      />
    </div>
  );
};

export default GameCanvas;
