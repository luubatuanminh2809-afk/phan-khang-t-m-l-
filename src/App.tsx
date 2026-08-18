import { useEffect } from "react";
import { GameProvider, useGame } from "./state/gameContext";
import { startMusic } from "./lib/music";
import { isMusicOn } from "./state/storage";
import { CoverScreen } from "./screens/CoverScreen";
import { ExploreScreen } from "./screens/ExploreScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { AchievementsScreen } from "./screens/AchievementsScreen";
import { EqPointsScreen } from "./screens/EqPointsScreen";
import { RoleSelectScreen } from "./screens/RoleSelectScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { DayIntroScreen } from "./screens/DayIntroScreen";
import { SituationScreen } from "./screens/SituationScreen";
import { RevealScreen } from "./screens/RevealScreen";
import { DayEndScreen } from "./screens/DayEndScreen";
import { ChestOpenScreen } from "./screens/ChestOpenScreen";
import { EvaluationScreen } from "./screens/EvaluationScreen";
import { LetterWriteScreen } from "./screens/LetterWriteScreen";
import { LetterReadScreen } from "./screens/LetterReadScreen";
import { FreeRoamDemoScreen } from "./screens/FreeRoamDemoScreen";
import { School3DScreen } from "./screens/School3DScreen";

function Router() {
  const { screen, session } = useGame();

  switch (screen) {
    case "cover":
      return <CoverScreen />;
    case "explore":
      return <ExploreScreen />;
    case "settings":
      return <SettingsScreen />;
    case "history":
      return <HistoryScreen />;
    case "achievements":
      return <AchievementsScreen />;
    case "eqPoints":
      return <EqPointsScreen />;
    case "profile":
      return <ProfileScreen />;
    case "roleSelect":
      return <RoleSelectScreen />;
    case "dayIntro":
      return <DayIntroScreen />;
    case "situation":
      // key forces a fresh mount per situation — otherwise React reuses the same
      // instance across situations within a day and lazy useState (shuffled options,
      // beat index, ambient detail) stays stuck on the first situation's values
      return <SituationScreen key={`${session?.dayIndex ?? 0}-${session?.currentIndex ?? 0}`} />;
    case "reveal":
      return <RevealScreen />;
    case "dayEnd":
      return <DayEndScreen />;
    case "chestOpen":
      return <ChestOpenScreen />;
    case "evaluation":
      return <EvaluationScreen />;
    case "freeRoamDemo":
      return <FreeRoamDemoScreen />;
    case "school3dDemo":
      return <School3DScreen />;
    case "letterWrite":
      return <LetterWriteScreen />;
    case "letterRead":
      return <LetterReadScreen />;
    default:
      return <CoverScreen />;
  }
}

function App() {
  useEffect(() => {
    // browsers refuse to start audio before the player has interacted, so the music
    // waits for the very first tap or keypress and then never asks again
    function begin() {
      if (isMusicOn()) startMusic();
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    }
    window.addEventListener("pointerdown", begin);
    window.addEventListener("keydown", begin);
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
    };
  }, []);

  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}

export default App;
