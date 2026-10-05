import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
export function usePersistentState<T>(
  key: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>, string] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : fallback;
      return Array.isArray(fallback) && !Array.isArray(parsed)
        ? fallback
        : parsed;
    } catch {
      return fallback;
    }
  });
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setError("");
    } catch {
      setError(
        "Browser storage is full or unavailable. Your latest changes will only last for this session.",
      );
    }
  }, [key, value]);
  return [value, setValue, error];
}
