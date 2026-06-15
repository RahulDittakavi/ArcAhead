import { useEffect, useState } from "react";

/** True when the viewport is phone-sized (≤ 768px). Drives responsive layout
 *  branches — we use inline styles throughout, which can't use CSS media
 *  queries, so layout decisions read this hook instead. */
export function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint}px)`;
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return mobile;
}
