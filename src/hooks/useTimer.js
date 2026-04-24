import { useEffect, useRef } from "react";

export function useTimer({ duration, isActive, onTick, onComplete }) {
  const savedTick = useRef(onTick);
  const savedComplete = useRef(onComplete);

  useEffect(() => {
    savedTick.current = onTick;
    savedComplete.current = onComplete;
  }, [onTick, onComplete]);

  useEffect(() => {
    if (!isActive || duration <= 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      savedTick.current?.();
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [duration, isActive]);

  useEffect(() => {
    if (duration === 0 && isActive) {
      savedComplete.current?.();
    }
  }, [duration, isActive]);
}
