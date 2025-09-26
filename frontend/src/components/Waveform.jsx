import React, { useEffect, useRef } from 'react';

const Waveform = ({ isActive, audioLevel }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    let time = 0;
    const bars = 64;
    const barWidth = width / bars;

    const animate = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (isActive) {
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;

          // Create geometric wave pattern
          const frequency1 = 0.02;
          const frequency2 = 0.015;
          const amplitude1 =
            Math.sin(time * frequency1 + i * 0.1) * (audioLevel * 50 + 10);
          const amplitude2 =
            Math.sin(time * frequency2 + i * 0.05) * (audioLevel * 30 + 5);

          const barHeight = Math.abs(amplitude1 + amplitude2);

          // Create pixelated effect
          const pixelHeight = Math.floor(barHeight / 4) * 4;

          // Neon green gradient
          const gradient = ctx.createLinearGradient(
            0,
            centerY - pixelHeight / 2,
            0,
            centerY + pixelHeight / 2
          );
          gradient.addColorStop(0, '#00FF41');
          gradient.addColorStop(0.5, '#00CC33');
          gradient.addColorStop(1, '#00FF41');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, centerY - pixelHeight / 2, barWidth - 2, pixelHeight);

          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00FF41';
          ctx.fillRect(x, centerY - pixelHeight / 2, barWidth - 2, pixelHeight);
          ctx.shadowBlur = 0;
        }

        time += 0.5;
      } else {
        // Idle state - flat line with subtle animation
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, audioLevel]);

  return (
    <div className="bg-black p-6 border-4 border-black">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg tracking-wide">AUDIO WAVEFORM</h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-[#00FF41] animate-pulse' : 'bg-gray-500'
            }`}
          ></div>
          <span className="text-white text-sm">
            {isActive ? 'LIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-30 bg-black border-2 border-gray-800"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default Waveform;
