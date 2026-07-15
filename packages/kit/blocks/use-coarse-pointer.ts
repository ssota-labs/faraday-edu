// True on tablets / phones where hover is unavailable (touch-primary).
import { useEffect, useState } from "react";

export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: none), (pointer: coarse)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const onChange = () => setCoarse(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
