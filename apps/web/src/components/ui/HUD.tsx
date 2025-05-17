import { cn } from "@/lib/utils";
import { TeamSwitcher } from "@/components/team-switcher";

const HUD = (child) => {
  return (
    <div className="h-screen w-screen bg-black-500 z-9999">
      <button>hello</button>
      {child}
    </div>
  );
};

export default HUD;
