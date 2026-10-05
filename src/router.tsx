import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
export type Page =
  | "marketplace"
  | "how-it-works"
  | "community"
  | "account"
  | "dashboard"
  | "equipment"
  | "not-found";
type Destination = "marketplace" | "how-it-works" | "community";
export type RouteTarget = Destination | `/${string}`;
const paths: Record<Destination, string> = {
  marketplace: "/",
  "how-it-works": "/how-it-works",
  community: "/community",
};
const titles: Record<Page, string> = {
  marketplace: "Farmigo — Find your next workhorse.",
  "how-it-works": "How it works — Farmigo",
  community: "Our community — Farmigo",
  account: "Your account — Farmigo",
  dashboard: "Owner dashboard — Farmigo",
  equipment: "Equipment — Farmigo",
  "not-found": "Page not found — Farmigo",
};
function currentPath() {
  return location.pathname + location.search;
}
function getPage(path: string): Page {
  const pathname = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (pathname === "/account") return "account";
  if (pathname === "/dashboard") return "dashboard";
  if (/^\/equipment\/[^/]+$/.test(pathname)) return "equipment";
  return (
    (Object.entries(paths).find(([, value]) => value === pathname)?.[0] as
      Destination | undefined) ?? "not-found"
  );
}
function href(target: RouteTarget) {
  return target.startsWith("/") ? target : paths[target as Destination];
}
const RouterContext = createContext<{
  page: Page;
  path: string;
  navigate: (target: RouteTarget) => void;
} | null>(null);
export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath);
  const page = getPage(path);
  useEffect(() => {
    if (
      location.pathname === "/" &&
      ["#community", "#how-it-works"].includes(location.hash)
    ) {
      history.replaceState(null, "", `/${location.hash.slice(1)}`);
      setPath(currentPath());
    }
    const back = () => setPath(currentPath());
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  useEffect(() => {
    document.title = titles[page];
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
  }, [path, page]);
  function navigate(target: RouteTarget) {
    const next = href(target);
    if (currentPath() !== next || location.hash)
      history.pushState(null, "", next);
    setPath(currentPath());
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <RouterContext.Provider value={{ page, path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
export function useRouter() {
  const value = useContext(RouterContext);
  if (!value) throw new Error("RouterProvider is missing");
  return value;
}
export function PageLink({
  page,
  onNavigate,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  page: RouteTarget;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  return (
    <a
      {...props}
      href={href(page)}
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
