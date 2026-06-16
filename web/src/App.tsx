import { useEffect, useState } from "react";
import { NavContext, type Nav, type Screen } from "./lib/nav";
import { AppLayout } from "./layout/AppLayout";
import { Landing } from "./screens/Landing/Landing";
import { ProgressSetup } from "./screens/Setup/ProgressSetup";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { EpisodeTracker } from "./screens/EpisodeTracker/EpisodeTracker";
import { ArcDetail } from "./screens/ArcDetail/ArcDetail";
import { CharacterLookup } from "./screens/CharacterLookup/CharacterLookup";
import { Search } from "./screens/Search/Search";
import { Settings } from "./screens/Settings/Settings";

const SERIES_TITLE = "One Piece"; // single tracked title for this build

export function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selArcId, setSelArcId] = useState<string | null>(null);
  const [selCharId, setSelCharId] = useState<string | null>(null);

  const go: Nav["go"] = (s) => {
    const next: Screen = s === "select" ? "setup" : s;
    if (next === "arc") setSelArcId(null); // open the *current* arc by default
    setScreen(next);
  };
  const openArc = (arcId: string) => {
    setSelArcId(arcId);
    setScreen("arc");
  };
  const openChar = (charId: string) => {
    setSelCharId(charId);
    setScreen("character");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const nav: Nav = { screen, go, openArc, openChar, selArcId, selCharId };

  if (screen === "landing") {
    return (
      <NavContext.Provider value={nav}>
        <Landing />
      </NavContext.Provider>
    );
  }

  let content: React.ReactNode = null;
  if (screen === "setup") content = <ProgressSetup seriesTitle={SERIES_TITLE} />;
  else if (screen === "dashboard") content = <Dashboard />;
  else if (screen === "episodes") content = <EpisodeTracker />;
  else if (screen === "arc") content = <ArcDetail arcId={selArcId} />;
  else if (screen === "character") content = <CharacterLookup initialCharId={selCharId} />;
  else if (screen === "search") content = <Search />;
  else if (screen === "settings") content = <Settings />;

  return (
    <NavContext.Provider value={nav}>
      <AppLayout title={SERIES_TITLE}>
        <div key={screen}>{content}</div>
      </AppLayout>
    </NavContext.Provider>
  );
}
