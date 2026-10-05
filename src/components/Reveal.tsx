import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    if (node.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    node.classList.add("reveal-pending");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.classList.remove("reveal-pending");
          node.classList.add("reveal-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`reveal ${className}`} ref={ref}>
      {children}
    </div>
  );
}
