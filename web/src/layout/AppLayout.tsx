import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav, BOTTOM_NAV_H } from "./BottomNav";
import { useIsMobile } from "../lib/useIsMobile";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {!isMobile && <Sidebar />}
      <main style={{ flex: 1, minWidth: 0, paddingBottom: isMobile ? BOTTOM_NAV_H : 0 }}>
        <TopBar title={title} />
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
