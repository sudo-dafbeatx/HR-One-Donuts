'use client';

import { useRef, useCallback } from 'react';

/**
 * useThrottle — prevents a callback from firing more than once within `delayMs`.
 *
 * Returns `[throttledFn, isThrottled]`:
 * - `throttledFn`: call this instead of the original handler.
 * - `isThrottled`: boolean ref you can read synchronously (e.g. to show a toast).
 *
 * The hook is intentionally ref-based so it never triggers re-renders on its own
 * and works correctly even when the component re-renders during async work.
 */
export function useThrottle<T extends (...args: never[]) => void>(
  callback: T,
  delayMs = 2000,
): [(...args: Parameters<T>) => void, React.RefObject<boolean>] {
  const lastCallRef = useRef<number>(0);
  const isThrottled = useRef<boolean>(false);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current < delayMs) {
        isThrottled.current = true;
        return; // swallow the call
      }
      isThrottled.current = false;
      lastCallRef.current = now;
      callback(...args);
    },
    [callback, delayMs],
  );

  return [throttled, isThrottled];
}
