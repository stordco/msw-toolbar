import { useRef, useEffect } from 'react';

/**
 * Borrowed from @chakra-ui/react
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/hooks/src/use-previous.ts
 */

export function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current as T;
}
