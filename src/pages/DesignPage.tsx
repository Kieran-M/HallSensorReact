import { DesignView } from "../components/simulator/scene/DesignView";
import { SidePanel } from "../components/ui/SidePanel";

export function DesignPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <DesignView />
      </div>

      <div className="w-100">
        <SidePanel />
      </div>
    </div>
  );
}