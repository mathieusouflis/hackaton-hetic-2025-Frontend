import InfiniteBoard from "@/components/InfiniteBoard";
import HUD from "@/components/hud";
import { useState } from "react";

function App() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  return (
    <div>
      <HUD selectedBoard={selectedBoard} onBoardChange={setSelectedBoard} />
      <InfiniteBoard boardName={selectedBoard} />
    </div>
  );
}

export default App;
