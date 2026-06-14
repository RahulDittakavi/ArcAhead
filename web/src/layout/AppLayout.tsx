import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <TopBar title={title} />
        {children}
      </main>
    </div>
  );
}
