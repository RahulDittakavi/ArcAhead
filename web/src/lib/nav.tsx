import { createContext, useContext } from "react";

export type Screen = "catalog" | "landing" | "setup" | "dashboard" | "episodes" | "arc" | "character" | "search" | "settings";

export interface Nav {
  screen: Screen;
  go: (s: Screen | "select") => void;
  openArc: (arcId: string) => void;
  openChar: (charId: string) => void;
  selArcId: string | null;
  selCharId: string | null;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const n = useContext(NavContext);
  if (!n) throw new Error("useNav must be used within NavContext");
  return n;
}
