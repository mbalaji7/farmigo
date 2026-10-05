import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

export type Page = "marketplace" | "how-it-works" | "community" | "not-found";
type Destination = Exclude<Page, "not-found">;
const paths: Record<Destination, string> = {
  marketplace: "/",
  "how-it-works": "/how-it-works",
  community: "/community",
};
const titles: Record<Page, string> = {
  marketplace: "Farmigo — Find your next workhorse.",
  "how-it-works": "How it works — Farmigo",
  community: "Our community — Farmigo",
  "not-found": "Page not found — Farmigo",
};
function currentPage(): Page {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return (
    (Object.entries(paths).find(([, value]) => value === path)?.[0] as
      Destination | undefined) ?? "not-found"
  );
}
const RouterContext = createContext<{
  page: Page;
  navigate: (page: Destination) => void;
} | null>(null);
export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(currentPage);
  useEffect(() => {
    // Keep links from the original single-page preview useful.
    if (
      window.location.pathname === "/" &&
      ["#community", "#how-it-works"].includes(window.location.hash)
    ) {
      window.history.replaceState(
        null,
        "",
        `/${window.location.hash.slice(1)}`,
      );
      setPage(currentPage());
    }
    const onBack = () => setPage(currentPage());
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);
  useEffect(() => {
    document.title = titles[page];
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  }, [page]);
  function navigate(destination: Destination) {
    if (window.location.pathname !== paths[destination] || window.location.hash)
      window.history.pushState(null, "", paths[destination]);
    setPage(destination);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <RouterContext.Provider value={{ page, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
export function useRouter() {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter must be used inside RouterProvider");
  return router;
}
export function PageLink({
  page,
  onNavigate,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  page: Destination;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  return (
    <a
      {...props}
      href={paths[page]}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        )
          return;
        event.preventDefault();
        onNavigate?.();
        router.navigate(page);
      }}
    >
      {children}
    </a>
  );
}
