import {
  Dispatch,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export default function useSafeState<T>(
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const isMountedRef = useRef(true);
  const [state, setState] = useState<T>(initialValue);

  useLayoutEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: SetStateAction<T>) => {
    if (isMountedRef.current) setState(value);
  }, []);

  return [state, setSafeState];
}
