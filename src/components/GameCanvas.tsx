import { forwardRef } from 'react';

interface GameCanvasProps {
  width: number;
  height: number;
}

/** Pure canvas surface. All drawing happens in the game loop, not in React. */
export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ width, height }, ref) => (
    <canvas ref={ref} width={width} height={height} className="game-canvas" />
  )
);

GameCanvas.displayName = 'GameCanvas';
