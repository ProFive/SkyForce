import { useEffect, type RefObject } from 'react';
import type { PoseLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';
import * as calibration from '../engine/calibration';
import type { GameInputMode, HandPosition, Vec2 } from '../types';

const WASM_BASE_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const POSE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

interface Options {
  videoRef: RefObject<HTMLVideoElement | null>;
  handPositionRef: RefObject<HandPosition>;
  mode: GameInputMode | undefined;
  active: boolean;
}

/**
 * Lazy-loads PoseLandmarker and/or FaceLandmarker when a game requests them.
 * Writes into handPositionRef without disturbing finger/hand fields.
 */
export const useAuxTracking = ({
  videoRef,
  handPositionRef,
  mode,
  active,
}: Options) => {
  useEffect(() => {
    if (!active || !mode || mode === 'hand') return;

    let cancelled = false;
    let rafId = 0;
    let poseLandmarker: PoseLandmarker | null = null;
    let faceLandmarker: FaceLandmarker | null = null;

    const clearAux = () => {
      const hp = handPositionRef.current;
      if (mode === 'pose') hp.pose = { available: false };
      if (mode === 'head') hp.headSteer = { available: false, x: 0.5 };
    };

    const init = async () => {
      const { FilesetResolver, PoseLandmarker, FaceLandmarker } = await import(
        '@mediapipe/tasks-vision'
      );
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);
      if (cancelled) return;

      if (mode === 'pose') {
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
      }
      if (mode === 'head') {
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }
      if (cancelled) {
        poseLandmarker?.close();
        faceLandmarker?.close();
        return;
      }
      detectLoop();
    };

    const detectLoop = () => {
      if (cancelled) return;
      const video = videoRef.current;

      if (video && video.readyState >= 2) {
        const t = performance.now();

        if (poseLandmarker) {
          const result = poseLandmarker.detectForVideo(video, t);
          if (result.landmarks && result.landmarks.length > 0) {
            const landmarks: Vec2[] = result.landmarks[0].map((p) => ({
              x: 1 - p.x,
              y: p.y,
            }));
            handPositionRef.current.pose = { available: true, landmarks };
          } else {
            handPositionRef.current.pose = { available: false };
          }
        }

        if (faceLandmarker) {
          const result = faceLandmarker.detectForVideo(video, t);
          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const nose = result.faceLandmarks[0][1];
            const rawX = 1 - nose.x;
            calibration.observe(rawX, nose.y);
            const mapped = calibration.apply(rawX, nose.y);
            handPositionRef.current.headSteer = {
              available: true,
              x: mapped.x,
            };
          } else {
            handPositionRef.current.headSteer = { available: false, x: 0.5 };
          }
        }
      }

      rafId = requestAnimationFrame(detectLoop);
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      poseLandmarker?.close();
      faceLandmarker?.close();
      clearAux();
    };
  }, [videoRef, handPositionRef, mode, active]);
};
