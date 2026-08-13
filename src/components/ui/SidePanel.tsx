import { useState } from "react";

import { PropertyCard } from "./PropertyCard";

import { MagnetSpecsSection } from "./MagnetSpecsSection";
import { MagnetGeometrySection } from "./MagnetGeometrySection";
import { MagnetMotionSection } from "./MagnetMotionSection";

import { useSimulation } from "../../hooks/useSimulation";

const TABS = [
  {
    id: "magnet",
    label: "Magnet",
  },
  {
    id: "sensor",
    label: "Sensor",
  },
  {
    id: "simSettings",
    label: "Simulation",
  },
];

export function SidePanel() {
  const [activeTab, setActiveTab] =
    useState("magnet");

  const { simulate } = useSimulation();

  return (
    <div
      className="
        flex
        h-full
        flex-col

        bg-slate-100
        border-l
        border-slate-200
      "
    >
      {/* Tabs */}

      <div
        className="
          flex
          border-b
          border-slate-200
          bg-white
        "
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id)
            }
            className={`
              flex-1
              px-4
              py-3
              text-sm
              font-medium
              transition-colors

              ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}

      <div
        className="
          flex-1
          overflow-y-auto
          p-4
          space-y-4
        "
      >
        {activeTab === "magnet" && (
          <>
            <PropertyCard title="Magnet Properties">
              <MagnetSpecsSection />
            </PropertyCard>

            <PropertyCard title="Geometry">
              <MagnetGeometrySection />
            </PropertyCard>

            <PropertyCard title="Motion">
              <MagnetMotionSection />
            </PropertyCard>
          </>
        )}

        {activeTab === "sensor" && (
          <PropertyCard title="Sensor">
            Sensor configuration
            coming soon
          </PropertyCard>
        )}

        {activeTab ===
          "simSettings" && (
          <PropertyCard title="Simulation">
            Simulation settings
            coming soon
          </PropertyCard>
        )}
      </div>

      {/* Footer */}

      <div
        className="
          border-t
          border-slate-200
          bg-white
          p-4
        "
      >
        <button
          className="
            w-full

            rounded-lg

            bg-blue-600
            px-4
            py-2

            text-sm
            font-medium
            text-white

            shadow-sm

            hover:bg-blue-700
            transition-colors
          "

          onClick={simulate}
        >
          Simulate
        </button>
      </div>
    </div>
  );
}