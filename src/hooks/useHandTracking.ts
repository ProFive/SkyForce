import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as calibration from '../engine/calibration';
import type { HandPosition } from '../types';

const WASM_BASE_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/**
 * Tracks the index-finger tip via MediaPipe and exposes the latest position
 * through a mutable ref. The ref lets the game loop read positions every frame
 * without triggering React re-renders.
 */
export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number>(0);

  // Latest hand position — read by the game loop, never causes re-render.
  const handPositionRef = useRef<HandPosition>({
    x: 0,
    y: 0,
    confidence: 0,
    available: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // 1. Load MediaPipe hand landmarker.
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
          numHands: 1,
          runningMode: 'VIDEO',
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        handLandmarkerRef.current = landmarker;

        // 2. Start the webcam.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        setIsLoading(false);
        detectLoop();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to initialize camera'
          );
          setIsLoading(false);
        }
      }
    };

    const detectLoop = () => {
      const video = videoRef.current;
      const landmarker = handLandmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        const result = landmarker.detectForVideo(video, performance.now());
        if (result.landmarks && result.landmarks.length > 0) {
          // Index-finger tip is landmark 8.
          const tip = result.landmarks[0][8];
          // Mirror X so moving your hand right moves the ship right.
          const rawX = 1 - tip.x;
          const rawY = tip.y;
          calibration.observe(rawX, rawY); // grows the box while calibrating
          const mapped = calibration.apply(rawX, rawY);
          handPositionRef.current = {
            x: mapped.x,
            y: mapped.y,
            confidence: 1,
            available: true,
          };
        } else {
          handPositionRef.current.available = false;
        }
      }
      rafRef.current = requestAnimationFrame(detectLoop);
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      handLandmarkerRef.current?.close();
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, handPositionRef, isLoading, error };
};
